import { Entity, EntityQueryOptions, EntityQueryScoreOptions, BlockLocation, Location, MolangVariableMap, Player, Vector, world } from "mojang-minecraft";
import { minusStat } from "../job/jobApi";
import { OVERWORLD } from "../common/constants";
import { passableBlockTypes, Projectile, projectileData, projectileEvent, ProjectileIdentifier } from "../common/projectileData";
import { getScore, Score, setScore } from "./scoreboard";
import { run, runCommand, runCommandOn } from "./common";

const PROJECTILE_NEAR = "maos_projectile_near";
const projectiles: Projectile[] = [];

let running = false;

const tickCallback = () => {
	const length = projectiles.length;
	if (!length) {
		running = false;
		world.events.tick.unsubscribe(tickCallback);
	}

	const removeIndexes = [];
	for(let i = 0; i < length; i++) {
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

		const dimension = projectile.dimension;

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
			dimension.spawnParticle(
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

		let prevBlockLocation: BlockLocation | null = null;
		const targets: Player[] = [];
		
		for(let j = 0; j < loopCount; j++) {
			const { location, rotation } = projectile;

			const blockLocation = new BlockLocation(location.x, location.y, location.z);
			if(!prevBlockLocation?.equals(blockLocation)) {
				prevBlockLocation = blockLocation;
				const block = dimension.getBlock(blockLocation);

				if (!passableBlockTypes.has(block.type)) {
					targets.splice(0, targets.length);
					removeIndexes.push(i);

					break;
				}
			}
			
			projectile.teleport(
				new Location(
					location.x + xPerLoop,
					location.y + yPerLoop,
					location.z + zPerLoop,
				),
				dimension,
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
					runCommandOn(projectile, `execute at @s positioned ~ ~-0.935 ~ run tag @e[family=game, r=${hitRange}] add ${PROJECTILE_NEAR}`, true);
					
					const scoreOptions: EntityQueryScoreOptions[] = [];
					if (scoreFlags) {
						for (const scoreFlag of scoreFlags) {
							scoreOptions.push({
								objective: scoreFlag.objectiveId,
								minScore: scoreFlag.minScore,
								maxScore: scoreFlag.maxScore,
								exclude: scoreFlag.exclude,
							});
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

					const option: EntityQueryOptions = {
						scoreOptions,
						tags: [PROJECTILE_NEAR],
						families: ["game"],
						closest: maxHitCount - currentHitCount
					};

					for(const target of dimension.getEntities(option)) {
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
			onHit(projectile, summoner, targets);
		}

		for(const target of targets) {
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
	const { location, rotation } = summoner;
	const spawnLocation = new Location(
		location.x + (offset?.x || 0),
		location.y + (offset?.y || 1.6),
		location.z + (offset?.z || 0),
	);

	const projectile = OVERWORLD.spawnEntity(identifier, spawnLocation);
	projectile.teleport(projectile.location, projectile.dimension, rotation.x, rotation.y);

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