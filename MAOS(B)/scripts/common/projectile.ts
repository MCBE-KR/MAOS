import { Entity, EntityQueryOptions, EntityQueryScoreOptions, Location, Player, Vector, world } from "mojang-minecraft";
import { Score } from "../api/scoreboard";
import { addStat } from "../job/jobApi";
import { OVERWORLD } from "./constants";

const PROJECTILE_NEAR = "maos_projectile_near";
const projectiles: Projectile[] = [];

let running = false;

interface ProjectileData {
	life: number;
	damage: number;
	initialSpeed: number;
	scoreFlags?: [
		{
			objectiveId: string;
			minScore: number;
			maxScore: number;
			exclude: boolean;
		},
	];
	maxHitCount: number;
	destroyAfterHit: boolean;
	keepUntilAllHit: boolean;
	hitRange: number | (() => Player[]);
}

export const projectileData: {
	[identifier: string]: ProjectileData
} = {
	"maos:j1s1": {
		life: 30,
		damage: 200,
		initialSpeed: 0.6,
		maxHitCount: 1,
		destroyAfterHit: true,
		keepUntilAllHit: false,
		hitRange: 0.9
	}
};

interface Projectile {
	entity: Entity;
	spawner: Player;
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
	maxHitCount: number;
	destroyAfterHit: boolean;
	keepUntilAllHit: boolean;
	hitRange: number | (() => Player[] | null);
	onHit?: (self: Entity, spawner: Player, targets: Player[]) => void;
	onTick?: {
		[tick: number]: (self: Entity, spawner: Player) => void;
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
		const projectile = projectiles[projectiles.length];
		const { entity, spawner, damage, vector, scoreFlags, hitRange, maxHitCount, onHit } = projectile;

		let tick = projectile.tick;

		try {
			entity.runCommand(`testfor @s`);
		} catch {
			removeIndexes.push(i);
			continue;
		}


		projectile.tick = ++tick;
		if (tick === projectile.life) {
			removeIndexes.push(i);
		}

		const onTick = projectile.onTick?.[tick];
		if(onTick) {
			onTick(entity, spawner);
		}

		const { location, rotation } = entity;
		const newLocation = new Location(
			location.x + vector.x,
			location.y + vector.y,
			location.z + vector.z,
		);
		
		entity.teleport(newLocation, OVERWORLD, rotation.x, rotation.y);

		let targets: Player[] | null;
		if(typeof hitRange === "number") {
			try {
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
				option.closest = maxHitCount;
				option.scoreOptions = scoreOptions;

				targets = Array.from(OVERWORLD.getEntities(option)) as Player[];
			} finally {
				OVERWORLD.runCommand(`tag @e remove ${PROJECTILE_NEAR}`);
			}
		} else {
			targets = hitRange();
		}

		const hitEntitiesCount = targets?.length;
		if(!hitEntitiesCount) {
			continue;
		}

		if(onHit) {
			onHit(entity, spawner, targets!);
		}

		for(const target of targets!) {
			spawner.runCommand(`damage "${target.name}" 1 entity_attack`);
			addStat(target, -damage, Score.hp, Score.maxhp);
		}

		if(projectile.destroyAfterHit || maxHitCount !== hitEntitiesCount) {
			removeIndexes.push(i);
			continue;
		}
	}

	for(const index of removeIndexes) {
		projectiles.splice(index, 1);
	}
};

export const addProjectile = (
	entity: Entity,
	spawner: Player,
	data: ProjectileData,
	viewVector: Vector,
	onHit?: (self: Entity, spawner: Player, targets: Player[]) => void,
	onTick?: {
		[tick: number]: (self: Entity, spawner: Player) => void
	}
) => {
	const {
		life,
		damage,
		initialSpeed,
		scoreFlags,
		maxHitCount,
		destroyAfterHit,
		keepUntilAllHit,
		hitRange,
	} = data;
	const { x, y, z } = viewVector;

	projectiles.push({
		entity,
		spawner,
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
		vector: new Vector(
			x * initialSpeed,
			y * initialSpeed,
			z * initialSpeed,
		),
	});

	if(!running) {
		running = true;
		world.events.tick.subscribe(tickCallback);
	}
};