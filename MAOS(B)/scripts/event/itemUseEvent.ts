import { world } from "mojang-minecraft";
import { isPlayer } from "../api/common";
import { send } from "../api/message";
import { getJob } from "../job/jobData";

world.events.itemUse.subscribe(event => {
	const { source, item } = event;
	if (!isPlayer(source)) {
		return;
	}

	const itemName = item.id;

	if(itemName.startsWith("maos:skill")) {
		const job = getJob(source);

		let skillNumber = itemName.endsWith("a") ? 1 : 3;
		if (source.isSneaking) {
			skillNumber++;
		}
		
		const [beforeSkill, skill] = job.getSkill(skillNumber);
		
		const invalidReason = beforeSkill(source);
		if(invalidReason) {
			send(source, invalidReason);
			return;
		}

		skill(source);
	}
});
