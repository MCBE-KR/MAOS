import { Player, world } from "mojang-minecraft";
import { runCommand } from "../api/common";
import { send } from "../api/message";
import { scores } from "../api/scoreboard";
import { ADMIN_LIST, OVERWORLD } from "../common/constants";
import { setJob } from "../job/jobData";

const initScoreboard = (player: Player) => {
	scores.forEach(score => {
		try {
			runCommand(`scoreboard objectives add ${score} dummy`);
		} catch {
			return;
		}
	});

	send(player, "Success");
};

const setPlayerJob = (player: Player, data: string) => {
	let target;
	let job;
	const split = data.split(" ");

	if(split.length === 1) {
		target = player;
		job = Number(split[0]);
	} else {
		let playerName = split[0];
		if(playerName.startsWith("\"")) {
			for(let i = 1; i < split.length; i++) {
				playerName += ` ${split[i]}`;

				if(playerName.endsWith("\"")) {
					playerName = playerName.replaceAll("\"", "");
					break;
				}
			}
		}

		target = Array.from(world.getPlayers())
			.find(p => p.name === playerName);
		if(!target) {
			throw new Error(`Unknown player - ${playerName}`);
		}

		job = Number(split[1]);
	}

	setJob(target, job);
	send(player, "Success");
};

const adminCommands: {[key: string]: (sender: Player, data: string) => void} = {
	"initScoreboard": initScoreboard,
	"setJob": setPlayerJob,
};

const commands: {[key: string]: (sender: Player, data: string) => void} = {
};

world.events.beforeChat.subscribe(event => {
	const { sender, message } = event;

	const key = message.split(" ")[0];
	const data = message.replace(key, "").trim();
	let func;

	if(ADMIN_LIST.includes(sender.name)) {
		func = adminCommands[key];
		
		if(func) {
			func(sender, data);
			event.cancel = true;

			return;
		}
	}

	func = commands[key];
	if(func) {
		func(sender, data);
		event.cancel = true;
	}
});
