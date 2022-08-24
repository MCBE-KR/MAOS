import { Dimension, Entity, Player } from "mojang-minecraft";
import { OVERWORLD } from "../common/constants";
import { getScore } from "./scoreboard";

export const format = (str: string, args: any[]) => {
	let i = 0;
	let result = str;
	for (const arg of args) {
		result = result.split(`{${i++}}`).join(arg);
	}

	return result;
};

export const exceptSpectator = (targets: Player[]) => {
	return targets.filter(target => !target.hasTag("spectator"));
};

export const gatAllies = (player: Player, targets: Player[]) => {
	const teamScore = getScore(player, "team");
	return targets.filter(target => getScore(target, "team") === teamScore);
};

export const getEnemies = (player: Player, targets: Player[]) => {
	const teamScore = getScore(player, "team");
	return targets.filter(target => getScore(target, "team") !== teamScore);
};

export const run = (func: any) => {
	try {
		func();
	// tslint:disable-next-line: no-empty
	} catch {}
};

export const runCommand = (command: string, ignoreError: boolean = false, dimension: Dimension = OVERWORLD) => {
	try {
		dimension.runCommand(command);
	} catch(e) {
		if(!ignoreError) {
			throw e;
		}
	}
};

export const runCommandAsync = (command: string, ignoreError: boolean = false, dimension: Dimension = OVERWORLD) => {
	try {
		dimension.runCommandAsync(command);
	} catch (e) {
		if (!ignoreError) {
			throw e;
		}
	}
};

export const runCommandOn = (entity: Entity, command: string, ignoreError: boolean = false) => {
	try {
		entity.runCommand(command);
	} catch(e) {
		if(!ignoreError) {
			throw e;
		}
	}
};

export const runCommandAsyncOn = (entity: Entity, command: string, ignoreError: boolean = false) => {
	try {
		entity.runCommandAsync(command);
	} catch(e) {
		if(!ignoreError) {
			throw e;
		}
	}
};