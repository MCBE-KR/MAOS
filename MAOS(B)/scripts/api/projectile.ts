import { Entity, EntityQueryOptions, EntityQueryScoreOptions, Location, MolangVariableMap, Player, Vector, world } from "mojang-minecraft";
import { minusStat } from "../job/jobApi";
import { OVERWORLD } from "../common/constants";
import { Projectile, projectileData, projectileEvent, ProjectileIdentifier } from "../common/projectileData";
import { getScore, Score, setScore } from "./scoreboard";
import { run, runCommand, runCommandOn } from "./common";

const PROJECTILE_NEAR = "maos_projectile_near";
const projectiles: Projectile[] = [];

let running = false;

const realTickCallback = (startIndex?: number) => {
	const length = startIndex ? 1 : projectiles.length;
	if (!length) {
		running = false;
		world.events.tick.unsubscribe(tickCallback);
	}

	const removeIndexes = [];
	for(let i = startIndex || 0; i < length; i++) {
		const projectileObj = projectiles[i];
		const {
			projectile,
			summoner,
			damage,
			vector,
			projectileParticle,
			molangVariableMap,
			scoreFlags,
			hitRange,
			maxHitCount,
			onHit,
		} = projectileObj;

		let currentHitCount = projectileObj.currentHitCount;
		let tick = projectileObj.tick;

		try {
			runCommandOn(projectile, "testfor @s");
			runCommandOn(summoner, "testfor @s");
		} catch {
			removeIndexes.push(i);
			continue;
		}

		projectileObj.tick = ++tick;
		if (tick === projectileObj.life) {
			const jobScore = getScore(summoner, "job");
			projectileEvent[jobScore]?.DESPAWN_PROJECTILE(summoner, projectileObj);

			removeIndexes.push(i);
		}

		if(projectileParticle) {
			projectile.dimension.spawnParticle(
				projectileParticle,
				projectile.location,
				molangVariableMap!,
			);
		}

		projectileObj.onTick?.[0](projectile, summoner);

		const onTick = projectileObj.onTick?.[tick];
		if(onTick) {
			onTick(projectile, summoner);
		}

		const { x: vectorX, y: vectorY, z: vectorZ } = vector;
		const maxVector = Math.max(
			Math.abs(vectorX),
			Math.abs(vectorY),
			Math.abs(vectorZ),
		);
		
		const loopCount = Math.abs(Math.ceil(maxVector / 0.4));
		const xPerLoop = vectorX / loopCount;
		const yPerLoop = vectorY / loopCount;
		const zPerLoop = vectorZ / loopCount;

		const targets: Player[] = [];
		for(let j = 0; j < loopCount; j++) {
			const { location, rotation } = projectile;
			
			projectile.teleport(
				new Location(
					location.x + xPerLoop,
					location.y + yPerLoop,
					location.z + zPerLoop,
				),
				projectile.dimension,
				rotation.x,
				rotation.y,
			);

			projectileObj.onLoopTick?.[0](projectile, summoner);

			const onLoopTick = projectileObj.onLoopTick?.[tick];
			if(onLoopTick) {
				onLoopTick(projectile, summoner);
			}

			if(typeof hitRange === "number") {
				try {
					runCommandOn(projectile, `execute at @s positioned ~ ~-0.935 ~ run tag @a[r=${hitRange}] add ${PROJECTILE_NEAR}`, true);
					
					const scoreOptions: EntityQueryScoreOptions[] = [];
					if (scoreFlags) {
						for (const scoreFlag of scoreFlags) {
							const scoreOption = new EntityQueryScoreOptions();
							scoreOption.objective = scoreFlag.objectiveId;
							scoreOption.minScore = scoreFlag.minScore;
							scoreOption.maxScore = scoreFlag.maxScore;
							scoreFlag.exclude = scoreFlag.exclude;

							scoreOptions.push(scoreOption);
						}
					}

					let objectiveId: Score = "team";
					const teamScore = getScore(projectile, objectiveId);
					
					let defaultScoreOption = new EntityQueryScoreOptions();
					defaultScoreOption.objective = objectiveId;
					defaultScoreOption.minScore = teamScore;
					defaultScoreOption.maxScore = teamScore;
					defaultScoreOption.exclude = true;
					scoreOptions.push(defaultScoreOption);

					objectiveId = "job";
					defaultScoreOption = new EntityQueryScoreOptions();
					defaultScoreOption.objective = objectiveId; 
					defaultScoreOption.minScore = 1;
					scoreOptions.push(defaultScoreOption);

					const option = new EntityQueryOptions();
					option.tags = [PROJECTILE_NEAR];
					option.type = "minecraft:player";
					option.closest = maxHitCount - currentHitCount;
					option.scoreOptions = scoreOptions;

					for(const target of projectile.dimension.getEntities(option)) {
						targets.push(target as Player);
					}
				} catch(e) {
					console.warn(e);
				} finally {
					runCommand(`tag @e remove ${PROJECTILE_NEAR}`, true);
				}
			} else {
				const hitTargets = hitRange();

				if(hitTargets) {
					for(const target of hitTargets) {
						targets.push(target);
					}
				}
			}
		}

		const hitEntitiesCount = targets.length;
		if(!hitEntitiesCount) {
			continue;
		}

		if(onHit) {
			onHit(projectile, summoner, targets!);
		}

		for(const target of targets!) {
			runCommandOn(summoner, `damage "${target.name}" 1 entity_attack`, true);
			minusStat(target, damage, "hp", "maxhp");
		}

		currentHitCount += hitEntitiesCount;
		projectileObj.currentHitCount = currentHitCount;
		
		if(projectileObj.destroyAfterHit || maxHitCount === currentHitCount) {
			removeIndexes.push(i);
		}
	}

	for(const index of removeIndexes) {
		run(() => {
			const projectileObj = projectiles.splice(index, 1)[0];
			projectileObj.projectile.triggerEvent("maos:despawn");
		});
	}
};

const tickCallback = () => {
	realTickCallback();
};

export const addProjectile = (
	identifier: ProjectileIdentifier,
	summoner: Player,
	viewVector: Vector,
	offset?: Vector,
	onHit?: (self: Entity, summoner: Player, targets: Player[]) => void,
	onTick?: {
		[tick: number]: (self: Entity, summoner: Player) => void;
	},
	onLoopTick?: {
		[tick: number]: (self: Entity, summoner: Player) => void;
	},
) => {
	const location = summoner.location;
	const spawnLocation = new Location(
		location.x + (offset?.x || 0),
		location.y + (offset?.y || 1.6),
		location.z + (offset?.z || 0),
	);

	const projectile = OVERWORLD.spawnEntity(identifier, spawnLocation);
	setScore(projectile, "team", getScore(summoner, "team"));

	const {
		life,
		damage,
		initialSpeed,
		scoreFlags,
		maxHitCount,
		destroyAfterHit,
		keepUntilAllHit,
		hitRange,
		steadyParticle,
		molangVariableMap
	} = projectileData[identifier];
	const { x, y, z } = viewVector;

	let projectileParticle;
	if(steadyParticle === true) {
		projectileParticle = identifier;
	}

	projectiles.push({
		projectile,
		summoner,
		life,
		damage,
		scoreFlags,
		maxHitCount,
		destroyAfterHit,
		keepUntilAllHit,
		projectileParticle,
		molangVariableMap: projectileParticle
			? molangVariableMap || new MolangVariableMap()
			: undefined,
		hitRange,
		onTick,
		onLoopTick,
		onHit,
		tick: 0,
		currentHitCount: 0,
		vector: new Vector(
			x * initialSpeed,
			y * initialSpeed,
			z * initialSpeed,
		),
	});

	if (!running) {
		running = true;
		world.events.tick.subscribe(tickCallback);
	}
};