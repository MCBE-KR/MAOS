import { Player, world } from "mojang-minecraft";
import { send } from "../api/message";
import { Score } from "../api/scoreboard";
import { ADMIN_LIST, OVERWORLD } from "../common/constants";
import { setJob } from "../job/job";

const initScoreboard = (player: Player) => {
	Object.values(Score).forEach(score => {
		try {
			OVERWORLD.runCommand(`scoreboard objectives add ${score} dummy`);
		} catch(ignored) { return; }
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
		target = Array.from(world.getPlayers())
			.find(p => p.name === split[0]);
		if(!target) {
			throw new Error(`Unknown player - ${split[0]}`);
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
