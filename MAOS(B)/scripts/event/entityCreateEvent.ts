import { world } from "mojang-minecraft";
import { isPlayer } from "../api/common";
import { IDENTIFIER_TAG } from "../common/constants";

const joinedPlayerNames: string[] = [];
let identifierIndex = 0;

world.events.playerJoin.subscribe(event => {
	const player = event.player;
	const playerName = player.name;

	if(joinedPlayerNames.includes(playerName)) {
		return;
	}

	joinedPlayerNames.push(playerName);
	player.addTag(`${IDENTIFIER_TAG}${identifierIndex++}`);
});

world.events.entityCreate.subscribe(event => {
	const entity = event.entity;
	if(isPlayer(entity)) {
		return;
	}

	entity.addTag(`${IDENTIFIER_TAG}${identifierIndex++}`);
});