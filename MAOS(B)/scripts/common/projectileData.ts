import * as mc from "mojang-minecraft";
import { addStun } from "../api/buff";
import { syncMn } from "../api/scoreboard";
import { JobEvent } from "../job/job";
import { addStat } from "../job/jobApi";

const projectileIdentifier = [
	"maos:j1s1",
	"maos:j1s2"
] as const;
export type ProjectileIdentifier = typeof projectileIdentifier[number];

export interface IProjectileData {
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
	hitRange: number | (() => mc.Entity[]);
	spawnSound?: string;
	tickSound?: string;
	tickSoundRate?: number;
	hitSound?: string;
	steadyParticle?: string | true;
	molangVariableMap?: mc.MolangVariableMap;
	getOffset?: (summoner: mc.Player) => mc.Vector;
	getOnHit?: (
		summoner: mc.Player,
	) => (self: mc.Entity, summoner: mc.Player, targets: mc.Entity[]) => void;
	getOnTick?: (summoner: mc.Player) => {
		[tick: number]: (self: mc.Entity, summoner: mc.Player) => void;
	};
	getOnLoopTick?: (summoner: mc.Player) => {
		[tick: number]: (self: mc.Entity, summoner: mc.Player) => void;
	};
}

export interface IProjectile {
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
	hitRange: number | (() => mc.Entity[] | null);
	tickSound?: string;
	tickSoundRate?: number;
	hitSound?: string;
	projectileParticle?: string;
	molangVariableMap?: mc.MolangVariableMap;
	onHit?: (
		self: mc.Entity,
		summoner: mc.Player,
		targets: mc.Entity[],
	) => void;
	onTick?: {
		[tick: number]: (self: mc.Entity, summoner: mc.Player) => void;
	};
	onLoopTick?: {
		[tick: number]: (self: mc.Entity, summoner: mc.Player) => void;
	};
}

export const projectileData: {
	[identifier in ProjectileIdentifier]: IProjectileData;
} = {
	"maos:j1s1": {
		life: 15,
		damage: 200,
		initialSpeed: 1.2,
		maxHitCount: 1,
		destroyAfterHit: true,
		keepUntilAllHit: false,
		hitRange: 1,
		spawnSound: "maos.j1s1_spawn",
		tickSound: "maos.j1s1_tick",
		tickSoundRate: 1,
		hitSound: "maos.j1s1_hit",
		steadyParticle: true,
	},
	"maos:j1s2": {
		life: 8,
		damage: 150,
		initialSpeed: 2,
		maxHitCount: 1,
		destroyAfterHit: true,
		keepUntilAllHit: false,
		hitRange: 1.1,
		steadyParticle: true,
		getOnHit: (_s) => {
			return (_self, _summoner, targets) => {
				const target = targets[0];
				addStun({
					entity: target,
					tick: 30,
				});
			};
		},
	},
};

export const passableBlockTypes: Set<mc.MinecraftBlockTypes> = new Set([
	mc.MinecraftBlockTypes.air,
	mc.MinecraftBlockTypes.water,
	mc.MinecraftBlockTypes.flowingWater,
	mc.MinecraftBlockTypes.conduit,
	mc.MinecraftBlockTypes.wallSign,
	mc.MinecraftBlockTypes.warpedWallSign,
	mc.MinecraftBlockTypes.birchWallSign,
	mc.MinecraftBlockTypes.acaciaWallSign,
	mc.MinecraftBlockTypes.jungleWallSign,
	mc.MinecraftBlockTypes.spruceWallSign,
	mc.MinecraftBlockTypes.crimsonWallSign,
	mc.MinecraftBlockTypes.darkoakWallSign,
	mc.MinecraftBlockTypes.mangroveWallSign,
	mc.MinecraftBlockTypes.standingSign,
	mc.MinecraftBlockTypes.birchStandingSign,
	mc.MinecraftBlockTypes.acaciaStandingSign,
	mc.MinecraftBlockTypes.jungleStandingSign,
	mc.MinecraftBlockTypes.warpedStandingSign,
	mc.MinecraftBlockTypes.crimsonStandingSign,
	mc.MinecraftBlockTypes.darkoakStandingSign,
	mc.MinecraftBlockTypes.spruceStandingSign,
	mc.MinecraftBlockTypes.mangroveStandingSign,
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
	mc.MinecraftBlockTypes.vine,
	mc.MinecraftBlockTypes.caveVines,
	mc.MinecraftBlockTypes.caveVinesBodyWithBerries,
	mc.MinecraftBlockTypes.caveVinesHeadWithBerries,
	mc.MinecraftBlockTypes.twistingVines,
	mc.MinecraftBlockTypes.weepingVines,
	mc.MinecraftBlockTypes.redstoneWire,
	mc.MinecraftBlockTypes.torch,
	mc.MinecraftBlockTypes.redstoneTorch,
	mc.MinecraftBlockTypes.soulTorch,
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
	mc.MinecraftBlockTypes.flowingLava,
	mc.MinecraftBlockTypes.bubbleColumn,
	mc.MinecraftBlockTypes.carpet,
	mc.MinecraftBlockTypes.azalea,
	mc.MinecraftBlockTypes.beetroot,
	mc.MinecraftBlockTypes.bigDripleaf,
	mc.MinecraftBlockTypes.smallDripleafBlock,
	mc.MinecraftBlockTypes.coloredTorchBp,
	mc.MinecraftBlockTypes.coloredTorchRg,
	mc.MinecraftBlockTypes.coral,
	mc.MinecraftBlockTypes.coralFan,
	mc.MinecraftBlockTypes.coralFanDead,
	mc.MinecraftBlockTypes.coralFanHang,
	mc.MinecraftBlockTypes.coralFanHang2,
	mc.MinecraftBlockTypes.coralFanHang3,
	mc.MinecraftBlockTypes.stoneButton,
	mc.MinecraftBlockTypes.birchButton,
	mc.MinecraftBlockTypes.acaciaButton,
	mc.MinecraftBlockTypes.jungleButton,
	mc.MinecraftBlockTypes.spruceButton,
	mc.MinecraftBlockTypes.warpedButton,
	mc.MinecraftBlockTypes.woodenButton,
	mc.MinecraftBlockTypes.crimsonButton,
	mc.MinecraftBlockTypes.darkOakButton,
	mc.MinecraftBlockTypes.mangroveButton,
	mc.MinecraftBlockTypes.polishedBlackstoneButton,
	mc.MinecraftBlockTypes.deadbush,
	mc.MinecraftBlockTypes.fire,
	mc.MinecraftBlockTypes.soulFire,
	mc.MinecraftBlockTypes.glowLichen,
	mc.MinecraftBlockTypes.hangingRoots,
	mc.MinecraftBlockTypes.kelp,
	mc.MinecraftBlockTypes.lever,
	mc.MinecraftBlockTypes.lightBlock,
	mc.MinecraftBlockTypes.mossCarpet,
	mc.MinecraftBlockTypes.movingBlock,
	mc.MinecraftBlockTypes.netherSprouts,
	mc.MinecraftBlockTypes.netherWart,
	mc.MinecraftBlockTypes.portal,
	mc.MinecraftBlockTypes.powderSnow,
	mc.MinecraftBlockTypes.unpoweredComparator,
	mc.MinecraftBlockTypes.unpoweredRepeater,
	mc.MinecraftBlockTypes.poweredComparator,
	mc.MinecraftBlockTypes.poweredRepeater,
	mc.MinecraftBlockTypes.reeds,
	mc.MinecraftBlockTypes.scaffolding,
	mc.MinecraftBlockTypes.seaPickle,
	mc.MinecraftBlockTypes.snowLayer,
	mc.MinecraftBlockTypes.sporeBlossom,
	mc.MinecraftBlockTypes.sweetBerryBush,
	mc.MinecraftBlockTypes.turtleEgg,
	mc.MinecraftBlockTypes.underwaterTorch,
	mc.MinecraftBlockTypes.unlitRedstoneTorch,
	mc.MinecraftBlockTypes.waterlily,
	mc.MinecraftBlockTypes.web,
	mc.MinecraftBlockTypes.witherRose,
]);

export const projectileEvent: {
	[jobScore: number]: {
		[event in JobEvent]?: (summoner: mc.Player, projectileObj: IProjectile) => void;
	};
} = {
	// IceMagician
	1: {
		DESPAWN_PROJECTILE: (summoner: mc.Player) => {
			addStat(summoner, 10, "mn", "maxmn");
			syncMn(summoner);
		},
		PROJECTILE_HIT_WALL: (summoner: mc.Player) => {
			addStat(summoner, 10, "mn", "maxmn");
			syncMn(summoner);
		}
	},
};