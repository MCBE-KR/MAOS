import { Entity, MinecraftBlockTypes, MolangVariableMap, Player, Vector } from "mojang-minecraft";
import { JobEvent } from "../job/job";
import { addStat } from "../job/jobApi";

export type ProjectileIdentifier = "maos:j1s1";

export interface ProjectileData {
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
	steadyParticle?: string | true;
	molangVariableMap?: MolangVariableMap;
}

export interface Projectile {
	projectile: Entity;
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
	projectileParticle?: string;
	molangVariableMap?: MolangVariableMap;
	onHit?: (self: Entity, summoner: Player, targets: Player[]) => void;
	onTick?: {
		[tick: number]: (self: Entity, summoner: Player) => void;
	};
	onLoopTick?: {
		[tick: number]: (self: Entity, summoner: Player) => void;
	};
}

export const projectileData: {
	[identifier in ProjectileIdentifier]: ProjectileData;
} = {
	"maos:j1s1": {
		life: 15,
		damage: 200,
		initialSpeed: 1.6,
		maxHitCount: 1,
		destroyAfterHit: true,
		keepUntilAllHit: false,
		hitRange: 1,
		steadyParticle: true
	},
};

export const passableBlockTypes: Set<MinecraftBlockTypes> = new Set([
	MinecraftBlockTypes.air,
	MinecraftBlockTypes.water,
	MinecraftBlockTypes.flowingWater,
	MinecraftBlockTypes.conduit,
	MinecraftBlockTypes.wallSign,
	MinecraftBlockTypes.standingSign,
	MinecraftBlockTypes.sapling,
	MinecraftBlockTypes.grass,
	MinecraftBlockTypes.tallgrass,
	MinecraftBlockTypes.seagrass,
	MinecraftBlockTypes.wallBanner,
	MinecraftBlockTypes.standingBanner,
	MinecraftBlockTypes.structureVoid,
	MinecraftBlockTypes.redMushroom,
	MinecraftBlockTypes.brownMushroom,
	MinecraftBlockTypes.wheat,
	MinecraftBlockTypes.cactus,
	MinecraftBlockTypes.carrots,
	MinecraftBlockTypes.potatoes,
	MinecraftBlockTypes.melonStem,
	MinecraftBlockTypes.pumpkinStem,
	MinecraftBlockTypes.warpedStem,
	MinecraftBlockTypes.crimsonStem,
	MinecraftBlockTypes.vine,
	MinecraftBlockTypes.caveVines,
	MinecraftBlockTypes.caveVinesBodyWithBerries,
	MinecraftBlockTypes.caveVinesHeadWithBerries,
	MinecraftBlockTypes.twistingVines,
	MinecraftBlockTypes.redstoneWire,
	MinecraftBlockTypes.torch,
	MinecraftBlockTypes.redstoneTorch,
	MinecraftBlockTypes.redFlower,
	MinecraftBlockTypes.yellowFlower,
	MinecraftBlockTypes.warpedFungus,
	MinecraftBlockTypes.crimsonFungus,
	MinecraftBlockTypes.frame,
	MinecraftBlockTypes.rail,
	MinecraftBlockTypes.goldenRail,
	MinecraftBlockTypes.detectorRail,
	MinecraftBlockTypes.activatorRail,
	MinecraftBlockTypes.lava,
	MinecraftBlockTypes.bubbleColumn,
	MinecraftBlockTypes.carpet,
	MinecraftBlockTypes.azalea,
	MinecraftBlockTypes.beetroot,
	MinecraftBlockTypes.bigDripleaf,
	MinecraftBlockTypes.smallDripleafBlock,
	MinecraftBlockTypes.coloredTorchBp,
	MinecraftBlockTypes.coloredTorchRg,
]);

export const projectileEvent: {
	[jobScore: number]: {
		[event in JobEvent]: (summoner: Player, projectilObj: Projectile) => void;
	};
} = {
	// IceMagician
	1: {
		DESPAWN_PROJECTILE: (summoner: Player) => {
			addStat(summoner, 5, "mn", "maxmn");
		},
	},
};