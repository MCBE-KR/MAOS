import { Player } from "mojang-minecraft";

export const send = (player: Player, message: string | object) => {
	const messageObject: any = {};
	
	if(typeof message === "string") {
		messageObject.rawtext = [{
			text: message
		}];
	} else {
		messageObject.rawtext = message;
	}

	player.runCommand(`tellraw @s ${JSON.stringify(messageObject)}`);
};