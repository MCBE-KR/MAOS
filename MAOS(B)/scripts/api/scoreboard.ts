import { Entity, world } from "mojang-minecraft";

const SCOREBOARD = world.scoreboard;

export const scores = [
	"job",
	"team",
	"maxhp",
	"hp",
	"maxmn",
	"mn",
	"hpRegen",
	"mnRegen",
	"baseCool1",
	"baseCool2",
	"baseCool3",
	"baseCool4",
	"cool1",
	"cool2",
	"cool3",
	"cool4",
	"strength",
	"stun",
	"poison",
] as const;
export type Score = typeof scores[number];

export const buffs: Score[] = [
	"strength",
];

export const debuffs: Score[] = [
	"stun",
	"poison",
];

export const buffActions: {
	[buff: string]: (entity: Entity) => void
} = {
	poison: (entity) => {
		
	}
};

export const getScore = (entity: Entity, objectiveId: Score, defaultValue: number | undefined = 0) => {
	try {
		return SCOREBOARD.getObjective(objectiveId).getScore(entity.scoreboard);
	} catch {
		return defaultValue;
	}
};

export const setScore = (entity: Entity, objectiveId: Score, value: number, isAsync: boolean = false) => {
	const command = `scoreboard players set @s ${objectiveId} ${value}`;

	if(isAsync) {
		return entity.runCommandAsync(command);
	}

	entity.runCommand(command);
};