import { Player } from "mojang-minecraft";
import { getScore, Score, setScore } from "../api/scoreboard";
import { IceMagician } from "./implement/iceMagician";
import { Job } from "./job";

export const getJob = (player: Player): Job => {
	return JOBS[getScore(player, Score.job)];
};

export const setJob = (player: Player, jobId: number) => {
	const job = JOBS[jobId];
	if (!job) {
		throw new Error(`Unknown jobId - ${jobId}`);
	}

	setScore(player, Score.job, jobId);
	job.initStat(player);
};

export const JOBS: { [key: number]: Job } = {
	1: new IceMagician(),
};
