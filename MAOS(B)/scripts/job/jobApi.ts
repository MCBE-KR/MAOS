import { Player } from "mojang-minecraft";
import { format } from "../api/common";
import { getScore, Score, setScore } from "../api/scoreboard";
import { SkillFailReason } from "./job";

export const addStat = (
	player: Player,
	stat: number,
	objectiveId: Score,
	maxObjectiveId: Score,
) => {
	const currentStat = getScore(player, objectiveId);
	if (currentStat < -stat) {
		console.warn(`Stat is minus - ${objectiveId} ${currentStat} ${stat}`);
		return;
	}

	const maxStat = getScore(player, maxObjectiveId);
	const resultStat = Math.min(currentStat + stat, maxStat);

	setScore(player, objectiveId, resultStat);
};

export const minusStat = (
	player: Player,
	stat: number,
	objectiveId: Score,
	maxObjectiveId: Score,
) => {
	addStat(player, -stat, objectiveId, maxObjectiveId);
};

export const addHp = (player: Player, hp: number) => {
	addStat(player, hp, "hp", "maxhp");
};

export const minusHp = (player: Player, hp: number) => {
	minusStat(player, hp, "hp", "maxhp");
};

export const addMn = (player: Player, mn: number) => {
	addStat(player, mn, "mn", "maxmn");
};

export const minusMn = (player: Player, mn: number) => {
	minusStat(player, mn, "mn", "maxmn");
};

export const checkCool = (player: Player, skillNumber: number) => {
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

	const cool = getScore(player, objectiveId);
	if (cool !== 0) {
		const baseCool = getScore(player, baseObjectiveId);
		return format(SkillFailReason.COOL_REMAIN, [
			skillNumber,
			cool / 20,
			baseCool / 20,
		]);
	}

	return null;
};

export const checkMn = (player: Player, skillNumber: number, mn: number) => {
	const success = getScore(player, "mn") >= mn;

	if (!success) {
		const currentMn = getScore(player, "mn");

		return format(SkillFailReason.REQUIRES_MN, [
			skillNumber,
			currentMn,
			mn,
		]);
	}

	return null;
};

export const checkCoolAndMn = (player: Player, skillNumber: number, mn: number) => {
	const coolMessage = checkCool(player, skillNumber);
	if (coolMessage) {
		return coolMessage;
	}

	return checkMn(player, skillNumber, mn);
};

export const setCoolToBase = (player: Player, skillIndex: 1 | 2 | 3 | 4) => {
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
	
	setScore(player, cool, getScore(player, baseCool));
};

export const resetScore = (player: Player) => {
	setScore(player, "hp", getScore(player, "maxhp"));
	setScore(player, "mn", getScore(player, "maxmn"));

	setScore(player, "cool1", 0);
	setScore(player, "cool2", 0);
	setScore(player, "cool3", 0);
	setScore(player, "cool4", 0);
};