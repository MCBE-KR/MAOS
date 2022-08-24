import { Entity, EntityQueryOptions, EntityQueryScoreOptions, Location, Player, Vector, world } from "mojang-minecraft";
import { minusStat } from "../job/jobApi";
import { OVERWORLD } from "../common/constants";
import { projectileData, projectileEvent, ProjectileIdentifier } from "../common/projectileData";
import { getScore, Score, setScore } from "./scoreboard";
import { run, runCommand, runCommandOn } from "./common";

const PROJECTILE_NEAR = "maos_projectile_near";
const projectiles: Projectile[] = [];

let running = false;

interface Projectile {
	entity: Entity;
	summoner: Player;
	life: number;
	damage: number;
	vector: Vector;
	tick: number;
	scoreFlags?: [
		{
			objectiveId: string;
			minScore: number;
			maxScore: number;
			exclude: boolean;
		},
	];
	currentHitCount: number;
	maxHitCount: number;
	destroyAfterHit: boolean;
	keepUntilAllHit: boolean;
	hitRange: number | (() => Player[] | null);
	onHit?: (self: Entity, summoner: Player, targets: Player[]) => void;
	onTick?: {
		[tick: number]: (self: Entity, summoner: Player) => void;
	};
	onLoopTick?: {
		[tick: number]: (self: Entity, summoner: Player) => void;
	};
}

const realTickCallback = (startIndex?: number) => {
	const length = startIndex ? 1 : projectiles.length;
	if (!length) {
		running = false;
		world.events.tick.unsubscribe(tickCallback);
	}

	const removeIndexes = [];
	for(let i = startIndex || 0; i < length; i++) {
		const projectile = projectiles[i];
		const {
			entity,
			summoner,
			damage,
			vector,
			scoreFlags,
			hitRange,
			maxHitCount,
			onHit,
		} = projectile;

		let currentHitCount = projectile.currentHitCount;
		let tick = projectile.tick;

		try {
			runCommandOn(entity, "testfor @s");
			runCommandOn(summoner, "testfor @s");
		} catch {
			removeIndexes.push(i);
			continue;
		}

		projectile.tick = ++tick;
		if (tick === projectile.life) {
			const jobScore = getScore(summoner, "job");
			projectileEvent[jobScore]?.DESPAWN_PROJECTILE(summoner, entity);

			removeIndexes.push(i);
		}

		projectile.onTick?.[0](entity, summoner);

		const onTick = projectile.onTick?.[tick];
		if(onTick) {
			onTick(entity, summoner);
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
			const { location, rotation } = entity;
			
			entity.teleport(
				new Location(
					location.x + xPerLoop,
					location.y + yPerLoop,
					location.z + zPerLoop,
				),
				entity.dimension,
				rotation.x,
				rotation.y,
			);

			projectile.onLoopTick?.[0](entity, summoner);

			const onLoopTick = projectile.onLoopTick?.[tick];
			if(onLoopTick) {
				onLoopTick(entity, summoner);
			}

			if(typeof hitRange === "number") {
				try {
					runCommandOn(entity, `execute at @s positioned ~ ~-0.935 ~ run tag @a[r=${hitRange}] add ${PROJECTILE_NEAR}`, true);
					
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
					const teamScore = getScore(entity, objectiveId);
					
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

					for(const target of entity.dimension.getEntities(option)) {
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
			onHit(entity, summoner, targets!);
		}

		for(const target of targets!) {
			runCommandOn(summoner, `damage "${target.name}" 1 entity_attack`, true);
			minusStat(target, damage, "hp", "maxhp");
		}

		currentHitCount += hitEntitiesCount;
		projectile.currentHitCount = currentHitCount;
		
		if(projectile.destroyAfterHit || maxHitCount === currentHitCount) {
			removeIndexes.push(i);
		}
	}

	for(const index of removeIndexes) {
		run(() => {
			const projectile = projectiles.splice(index, 1)[0];
			projectile.entity.triggerEvent("maos:despawn");
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

	const entity = OVERWORLD.spawnEntity(identifier, spawnLocation);
	setScore(entity, "team", getScore(summoner, "team"));

	const {
		life,
		damage,
		initialSpeed,
		scoreFlags,
		maxHitCount,
		destroyAfterHit,
		keepUntilAllHit,
		hitRange,
	} = projectileData[identifier];
	const { x, y, z } = viewVector;

	projectiles.push({
		entity,
		summoner,
		life,
		damage,
		scoreFlags,
		maxHitCount,
		destroyAfterHit,
		keepUntilAllHit,
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