import { Entity, world } from "mojang-minecraft";

const SCOREBOARD = world.scoreboard;

export const scores = [
	"job",
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
] as const;
export type Score = typeof scores[number];

export const getScore = (entity: Entity, objectiveId: Score) => {
	return SCOREBOARD.getObjective(objectiveId).getScore(entity.scoreboard);
};

export const setScore = (entity: Entity, objectiveId: Score, value: number) => {
	entity.runCommand(`scoreboard players set @s ${objectiveId} ${value}`);
};