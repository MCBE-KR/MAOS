import { Player } from "mojang-minecraft";
import { runCommandOn } from "./common";

export const send = (player: Player, message: string | number | object) => {
	const messageObject: any = {};
	
	const messageType = typeof message;
	if(messageType === "string" || messageType === "number") {
		messageObject.rawtext = [{
			text: String(message)
		}];
	} else {
		messageObject.rawtext = message;
	}

	runCommandOn(player, `tellraw @s ${JSON.stringify(messageObject)}`);
};