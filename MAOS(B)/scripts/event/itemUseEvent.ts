import { Player, world } from "mojang-minecraft";
import { isPlayer } from "../api/common";
import { send } from "../api/message";
import { getJob } from "../job/jobData";

world.events.itemUse.subscribe(event => {
	const { source, item } = event;
	if (!isPlayer(source)) {
		return;
	}

	const player = source as Player;
	const itemName = item.id;

	if(itemName.startsWith("maos:skill")) {
		const job = getJob(player);

		let skillNumber = itemName.endsWith("a") ? 1 : 3;
		if (player.isSneaking) {
			skillNumber++;
		}
		
		const [beforeSkill, skill] = job.getSkill(skillNumber);
		
		const invalidReason = beforeSkill(player);
		if(invalidReason) {
			send(player, invalidReason);
			return;
		}

		skill(player);
	}
});
