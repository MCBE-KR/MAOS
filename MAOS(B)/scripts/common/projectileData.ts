import { Player } from "mojang-minecraft";

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
}

export const projectileData: {
	[identifier in ProjectileIdentifier]: ProjectileData;
} = {
	"maos:j1s1": {
		life: 30,
		damage: 200,
		initialSpeed: 0.6,
		maxHitCount: 1,
		destroyAfterHit: true,
		keepUntilAllHit: false,
		hitRange: 0.9,
	},
};