import { Player, Vector } from "mojang-minecraft";
import { format } from "../api/common";
import { send } from "../api/message";
import { getScore, Score, setScore } from "../api/scoreboard";

export enum JobEvent {
	DESPAWN_PROJECTILE,
}

export const SkillFailReason = {
	COOL_REMAIN: "§c스킬 {0} 쿨타임: [§l{1}/{2}§r§c]",
	REQUIRES_MN: "§b스킬 {0} 마나: [§l{1}/{2}§r§b]",
};

export abstract class Job {
	abstract initStat(player: Player): void;

	abstract beforeExecute1(player: Player): null | string;
	abstract beforeExecute2(player: Player): null | string;
	abstract beforeExecute3(player: Player): null | string;
	abstract beforeExecute4(player: Player): null | string;

	abstract execute1(player: Player): void;
	abstract execute2(player: Player): void;
	abstract execute3(player: Player): void;
	abstract execute4(player: Player): void;

	abstract triggerEvent(event: JobEvent): void;

	getSkill = (
		skillNumber: number,
	): [(player: Player) => null | string, (player: Player) => void] => {
		switch (skillNumber) {
			case 1:
				return [this.beforeExecute1, this.execute1];

			case 2:
				return [this.beforeExecute2, this.execute2];

			case 3:
				return [this.beforeExecute3, this.execute3];

			case 4:
				return [this.beforeExecute4, this.execute4];

			default:
				throw new Error("Undefined skill");
		}
	}
}

export const getJob = (player: Player): Job => {
	return JOBS[getScore(player, Score.job)];
};

export const setJob = (player: Player, jobId: number) => {
	const job = JOBS[jobId];
	if(!job) {
		throw new Error(`Unknown jobId - ${jobId}`);
	}

	setScore(player, Score.job, jobId);
	job.initStat(player);
};

const addStat = (player: Player, stat: number, objectiveId: string, maxObjectiveId: string) => {
	const currentStat = getScore(player, objectiveId);
	if (currentStat < -stat) {
		console.warn(`Stat is minus - ${objectiveId} ${currentStat} ${stat}`);
		return;
	}

	const maxStat = getScore(player, maxObjectiveId);
	const resultStat = Math.min(currentStat + stat, maxStat);

	setScore(player, objectiveId, resultStat);
};

const checkCool = (player: Player, skillNumber: number) => {
	let baseObjectiveId;
	let objectiveId;
	switch(skillNumber) {
		case 1:
			baseObjectiveId = Score.baseCool1;
			objectiveId = Score.cool1;

			break;
			
		case 2:
			baseObjectiveId = Score.baseCool2;
			objectiveId = Score.cool2;

			break;
			
		case 3:
			baseObjectiveId = Score.baseCool3;
			objectiveId = Score.cool3;

			break;
			
		case 4:
			baseObjectiveId = Score.baseCool4;
			objectiveId = Score.cool4;

			break;

		default:
			throw new Error(`Unknown skill number - ${skillNumber}`);
	}

	const cool = getScore(player, objectiveId);
	const success = cool === 0;
	if(!success) {
		const baseCool = getScore(player, baseObjectiveId);
		return format(SkillFailReason.COOL_REMAIN, [skillNumber, cool / 20, baseCool / 20]);
	}

	return null;
};

const checkMn = (player: Player, skillNumber: number, mn: number) => {
	const success = getScore(player, Score.mn) >= mn;
	if (!success) {
		const currentMn = getScore(player, Score.mn);
		return format(SkillFailReason.REQUIRES_MN, [skillNumber, currentMn, -mn]);
	}

	return null;
};

const checkCoolAndMn = (player: Player, skillNumber: number, mn: number) => {
	const coolMessage = checkCool(player, skillNumber);
	if(coolMessage) {
		return coolMessage;
	}

	return checkMn(player, skillNumber, mn);
};

const resetScore = (player: Player) => {
	setScore(player, Score.hp, getScore(player, Score.maxhp));
	setScore(player, Score.mn, getScore(player, Score.maxmn));
	
	setScore(player, Score.cool1, 0);
	setScore(player, Score.cool2, 0);
	setScore(player, Score.cool3, 0);
	setScore(player, Score.cool4, 0);
};

class IceMagician extends Job {
	initStat(player: Player): void {
		setScore(player, Score.maxhp, 2000);
		setScore(player, Score.maxmn, 200);
		setScore(player, Score.hpRegen, 7);
		setScore(player, Score.mnRegen, 10);

		setScore(player, Score.baseCool1, 50);
		setScore(player, Score.baseCool2, 100);
		setScore(player, Score.baseCool3, 150);
		setScore(player, Score.baseCool4, 400);

		resetScore(player);
	}

	beforeExecute1(player: Player): string | null {
		return checkCoolAndMn(player, 1, -30);
	}

	beforeExecute2(player: Player): string | null {
		return checkCoolAndMn(player, 2, -50);
	}

	beforeExecute3(player: Player): string | null {
		return checkCoolAndMn(player, 3, -70);
	}

	beforeExecute4(player: Player): string | null {
		return checkCoolAndMn(player, 4, -100);
	}

	execute1(player: Player): void {
		setScore(player, Score.cool1, getScore(player, Score.baseCool1));
		addStat(player, -30, Score.mn, Score.maxmn);

		send(player, "s1");
	}

	execute2(player: Player): void {
		setScore(player, Score.cool2, getScore(player, Score.baseCool2));
		addStat(player, -50, Score.mn, Score.maxmn);

		send(player, "s2");
	}

	execute3(player: Player): void {
		setScore(player, Score.cool3, getScore(player, Score.baseCool3));
		addStat(player, -70, Score.mn, Score.maxmn);

		send(player, "s3");
	}

	execute4(player: Player): void {
		setScore(player, Score.cool4, getScore(player, Score.baseCool4));
		addStat(player, -100, Score.mn, Score.maxmn);
		
		send(player, "s4");
	}

	triggerEvent(event: JobEvent): void {
		if (event !== JobEvent.DESPAWN_PROJECTILE) {
			return;
		}
	}
}

export const JOBS: { [key: number]: Job } = {
	1: new IceMagician(),
};