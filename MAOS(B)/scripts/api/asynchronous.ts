import { world } from "mojang-minecraft";

let currentTick = 0;
let running = false;

const queue: {
	[tick: number]: [{
		args?: any[],
		callback: (args?: any[]) => void
	}]
} = {};

const tickCallback = () => {
	currentTick++;

	if(!Object.keys(queue).length) {
		running = false;
		world.events.tick.unsubscribe(tickCallback);
	}

	const tasks = queue[currentTick];
	if(!tasks) {
		return;
	}

	for(const task of tasks) {
		task.callback(task.args);
	}

	delete queue[currentTick];
};

// TODO: Promise 추가
export const addTask = (afterTick: number, callback: (args?: any[]) => void, args?: any[]) => {
	if(afterTick <= 0) {
		callback();
		return;
	}

	const tick = currentTick + afterTick;
	const task = {
		callback,
		args
	};

	let tasks = queue[tick];
	if(!tasks) {
		tasks = [task];
		queue[tick] = tasks;
	} else {
		tasks.push(task);
	}

	if(!running) {
		running = true;
		world.events.tick.subscribe(tickCallback);
	}
};