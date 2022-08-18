import { Entity, EntityQueryOptions, EntityQueryScoreOptions, Location, Player, Vector, world } from "mojang-minecraft";
import { minusStat } from "../job/jobApi";
import { OVERWORLD } from "../common/constants";
import { projectileData, projectileEvent, ProjectileIdentifier } from "../common/projectileData";
import { JobEvent } from "../job/job";
import { getScore } from "./scoreboard";

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
}

const tickCallback = () => {
	const length = projectiles.length;

	if (!length) {
		running = false;
		world.events.tick.unsubscribe(tickCallback);
	}

	const removeIndexes = [];
	for(let i = 0; i < length; i++) {
		const projectile = projectiles[i];
		const {
			entity,
			summoner: summoner,
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
			entity.runCommand(`testfor @s`);
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

		const onTick = projectile.onTick?.[tick];
		if(onTick) {
			onTick(entity, summoner);
		}

		const { location, rotation } = entity;
		const newLocation = new Location(
			location.x + vector.x,
			location.y + vector.y,
			location.z + vector.z,
		);
		
		entity.teleport(newLocation, OVERWORLD, rotation.x, rotation.y);

		let targets: Player[] | null = null;
		if(typeof hitRange === "number") {
			try {
				// 다른 팀만 가져오도록
				entity.runCommand(`tag @a[r=${hitRange}] add ${PROJECTILE_NEAR}`);

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

				const option = new EntityQueryOptions();
				option.tags = [PROJECTILE_NEAR];
				option.type = "minecraft:player";
				option.closest = maxHitCount - currentHitCount;
				option.scoreOptions = scoreOptions;

				targets = Array.from(OVERWORLD.getEntities(option)) as Player[];
			// tslint:disable-next-line: no-empty
			} catch {
			} finally {
				try {
					OVERWORLD.runCommand(`tag @e remove ${PROJECTILE_NEAR}`);
				// tslint:disable-next-line: no-empty
				} catch {}
			}
		} else {
			targets = hitRange();
		}

		const hitEntitiesCount = targets?.length;
		if(!hitEntitiesCount) {
			continue;
		}

		if(onHit) {
			onHit(entity, summoner, targets!);
		}

		for(const target of targets!) {
			try {
				summoner.runCommand(`damage "${target.name}" 1 entity_attack`);
			// tslint:disable-next-line: no-empty
			} catch {}

			minusStat(target, damage, "hp", "maxhp");
		}

		currentHitCount += hitEntitiesCount;
		projectile.currentHitCount = currentHitCount;
		
		if(projectile.destroyAfterHit || maxHitCount === currentHitCount) {
			removeIndexes.push(i);
		}
	}

	for(const index of removeIndexes) {
		const projectile = projectiles.splice(index, 1)[0];
		projectile.entity.triggerEvent("maos:despawn");
	}
};

export const addProjectile = (
	identifier: ProjectileIdentifier,
	summoner: Player,
	viewVector: Vector,
	offset: Vector,
	onHit?: (self: Entity, summoner: Player, targets: Player[]) => void,
	onTick?: {
		[tick: number]: (self: Entity, summoner: Player) => void;
	},
) => {
	const location = summoner.location;
	const spawnLocation = new Location(
		location.x + offset.x,
		location.y + offset.y,
		location.z + offset.z,
	);
	const entity = OVERWORLD.spawnEntity(identifier, spawnLocation);

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
		onHit,
		onTick,
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