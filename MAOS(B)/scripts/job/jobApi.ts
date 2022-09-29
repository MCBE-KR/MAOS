import { Entity } from "mojang-minecraft";
import { format } from "../api/common";
import { getScore, Score, setScore } from "../api/scoreboard";
import { SkillFailReason } from "./job";

export const addStat = (
	entity: Entity,
	stat: number,
	objectiveId: Score,
	maxObjectiveId: Score,
) => {
	const currentStat = getScore(entity, objectiveId);
	if (currentStat < -stat) {
		console.warn(`Stat is minus - ${objectiveId} ${currentStat} ${stat}`);
		return;
	}

	const maxStat = getScore(entity, maxObjectiveId);
	const resultStat = Math.min(currentStat + stat, maxStat);

	setScore(entity, objectiveId, resultStat);
};

export const minusStat = (
	entity: Entity,
	stat: number,
	objectiveId: Score,
	maxObjectiveId: Score,
) => {
	addStat(entity, -stat, objectiveId, maxObjectiveId);
};

export const addHp = (entity: Entity, hp: number) => {
	addStat(entity, hp, "hp", "maxhp");
};

export const minusHp = (entity: Entity, hp: number) => {
	minusStat(entity, hp, "hp", "maxhp");
};

export const addMn = (entity: Entity, mn: number) => {
	addStat(entity, mn, "mn", "maxmn");
};

export const minusMn = (entity: Entity, mn: number) => {
	minusStat(entity, mn, "mn", "maxmn");
};

export const checkCool = (entity: Entity, skillNumber: number) => {
	let baseObjectiveId: Score;
	let objectiveId: Score;
	
	switch (skillNumber) {
		case 1:
			baseObjectiveId = "baseCool1";
			objectiveId = "cool1";

			break;

		case 2:
			baseObjectiveId = "baseCool2";
			objectiveId = "cool2";

			break;

		case 3:
			baseObjectiveId = "baseCool3";
			objectiveId = "cool3";

			break;

		case 4:
			baseObjectiveId = "baseCool4";
			objectiveId = "cool4";

			break;

		default:
			throw new Error(`Unknown skill number - ${skillNumber}`);
	}

	const cool = getScore(entity, objectiveId);
	if (cool !== 0) {
		const baseCool = getScore(entity, baseObjectiveId);
		return format(SkillFailReason.COOL_REMAIN, [
			skillNumber,
			cool / 20,
			baseCool / 20,
		]);
	}

	return null;
};

export const checkMn = (entity: Entity, skillNumber: number, mn: number) => {
	const success = getScore(entity, "mn") >= mn;

	if (!success) {
		const currentMn = getScore(entity, "mn");

		return format(SkillFailReason.REQUIRES_MN, [
			skillNumber,
			currentMn,
			mn,
		]);
	}

	return null;
};

export const checkCoolAndMn = (entity: Entity, skillNumber: number, mn: number) => {
	const coolMessage = checkCool(entity, skillNumber);
	if (coolMessage) {
		return coolMessage;
	}

	return checkMn(entity, skillNumber, mn);
};

export const setCoolToBase = (entity: Entity, skillIndex: 1 | 2 | 3 | 4) => {
	let cool: Score;
	let baseCool: Score;

	switch(skillIndex) {
		case 1:
			cool = "cool1";
			baseCool = "baseCool1";

			break;

		case 2:
			cool = "cool2";
			baseCool = "baseCool2";

			break;

		case 3:
			cool = "cool3";
			baseCool = "baseCool3";

			break;

		default:
			cool = "cool4";
			baseCool = "baseCool4";

			break;
	}
	
	setScore(entity, cool, getScore(entity, baseCool));
};

export const resetScore = (entity: Entity) => {
	setScore(entity, "hp", getScore(entity, "maxhp"));
	setScore(entity, "mn", getScore(entity, "maxmn"));

	setScore(entity, "cool1", 0);
	setScore(entity, "cool2", 0);
	setScore(entity, "cool3", 0);
	setScore(entity, "cool4", 0);
};