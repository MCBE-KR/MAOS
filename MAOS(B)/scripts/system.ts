import { system } from "mojang-minecraft";

system.events.beforeWatchdogTerminate.subscribe(event => {
	console.warn(event.terminateReason);
	event.cancel = true;
});