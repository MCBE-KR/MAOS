import * as mc from "mojang-minecraft";
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
	hitRange: number | (() => mc.Player[]);
	steadyParticle?: string | true;
	molangVariableMap?: mc.MolangVariableMap;
}

export interface Projectile {
	projectile: mc.Entity;
	summoner: mc.Player;
	life: number;
	damage: number;
	vector: mc.Vector;
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
	hitRange: number | (() => mc.Player[] | null);
	projectileParticle?: string;
	molangVariableMap?: mc.MolangVariableMap;
	onHit?: (self: mc.Entity, summoner: mc.Player, targets: mc.Player[]) => void;
	onTick?: {
		[tick: number]: (self: mc.Entity, summoner: mc.Player) => void;
	};
	onLoopTick?: {
		[tick: number]: (self: mc.Entity, summoner: mc.Player) => void;
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

export const passableBlockTypes: Set<mc.MinecraftBlockTypes> = new Set([
	mc.MinecraftBlockTypes.air,
	mc.MinecraftBlockTypes.water,
	mc.MinecraftBlockTypes.flowingWater,
	mc.MinecraftBlockTypes.conduit,
	mc.MinecraftBlockTypes.wallSign,
	mc.MinecraftBlockTypes.standingSign,
	mc.MinecraftBlockTypes.sapling,
	mc.MinecraftBlockTypes.grass,
	mc.MinecraftBlockTypes.tallgrass,
	mc.MinecraftBlockTypes.seagrass,
	mc.MinecraftBlockTypes.wallBanner,
	mc.MinecraftBlockTypes.standingBanner,
	mc.MinecraftBlockTypes.structureVoid,
	mc.MinecraftBlockTypes.redMushroom,
	mc.MinecraftBlockTypes.brownMushroom,
	mc.MinecraftBlockTypes.wheat,
	mc.MinecraftBlockTypes.cactus,
	mc.MinecraftBlockTypes.carrots,
	mc.MinecraftBlockTypes.potatoes,
	mc.MinecraftBlockTypes.melonStem,
	mc.MinecraftBlockTypes.pumpkinStem,
	mc.MinecraftBlockTypes.warpedStem,
	mc.MinecraftBlockTypes.crimsonStem,
	mc.MinecraftBlockTypes.vine,
	mc.MinecraftBlockTypes.caveVines,
	mc.MinecraftBlockTypes.caveVinesBodyWithBerries,
	mc.MinecraftBlockTypes.caveVinesHeadWithBerries,
	mc.MinecraftBlockTypes.twistingVines,
	mc.MinecraftBlockTypes.redstoneWire,
	mc.MinecraftBlockTypes.torch,
	mc.MinecraftBlockTypes.redstoneTorch,
	mc.MinecraftBlockTypes.redFlower,
	mc.MinecraftBlockTypes.yellowFlower,
	mc.MinecraftBlockTypes.warpedFungus,
	mc.MinecraftBlockTypes.crimsonFungus,
	mc.MinecraftBlockTypes.frame,
	mc.MinecraftBlockTypes.rail,
	mc.MinecraftBlockTypes.goldenRail,
	mc.MinecraftBlockTypes.detectorRail,
	mc.MinecraftBlockTypes.activatorRail,
	mc.MinecraftBlockTypes.lava,
	mc.MinecraftBlockTypes.bubbleColumn,
	mc.MinecraftBlockTypes.carpet,
	mc.MinecraftBlockTypes.azalea,
	mc.MinecraftBlockTypes.beetroot,
	mc.MinecraftBlockTypes.bigDripleaf,
	mc.MinecraftBlockTypes.smallDripleafBlock,
	mc.MinecraftBlockTypes.coloredTorchBp,
	mc.MinecraftBlockTypes.coloredTorchRg,
]);

export const projectileEvent: {
	[jobScore: number]: {
		[event in JobEvent]: (summoner: mc.Player, projectilObj: Projectile) => void;
	};
} = {
	// IceMagician
	1: {
		DESPAWN_PROJECTILE: (summoner: mc.Player) => {
			addStat(summoner, 5, "mn", "maxmn");
		},
	},
};