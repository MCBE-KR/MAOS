import { Entity } from "mojang-minecraft";
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

export const exceptSpectator = (targets: Entity[]) => {
	return targets.filter(target => !target.hasTag("spectator"));
};

export const gatAllies = (player: Entity, targets: Entity[]) => {
	const teamScore = getScore(player, "team");
	return targets.filter(target => getScore(target, "team") === teamScore);
};

export const getEnemies = (player: Entity, targets: Entity[]) => {
	const teamScore = getScore(player, "team");
	return targets.filter(target => getScore(target, "team") !== teamScore);
};

export const run = (func: any) => {
	try {
		func();
	// tslint:disable-next-line: no-empty
	} catch {}
};

export const handleError = (e: unknown, ignoreError: boolean) => {
	if(!ignoreError) {
		throw e;
	}
};

export const runCommand = (
	command: string,
	ignoreError: boolean = false
) => {
	try {
		OVERWORLD.runCommand(command);
	} catch (e) {
		handleError(e, ignoreError);
	}
};

export const runCommandAsync = async (
	command: string,
	ignoreError: boolean = false
) => {
	return OVERWORLD.runCommandAsync(command).catch((e) => {
		handleError(e, ignoreError);
	});
};

export const runCommandOn = (
	entity: Entity,
	command: string,
	ignoreError: boolean = false,
) => {
	try {
		entity.runCommand(command);
	} catch (e) {
		handleError(e, ignoreError);
	}
};

export const runCommandAsyncOn = async (
	entity: Entity,
	command: string,
	ignoreError: boolean = false,
) => {
	return entity.runCommandAsync(command).catch((e) => {
		handleError(e, ignoreError);
	});
};

export const isPlayer = (entity: Entity) => {
	return entity.id === "minecraft:player";
}