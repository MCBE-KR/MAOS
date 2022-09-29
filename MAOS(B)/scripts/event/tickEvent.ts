import { world } from "mojang-minecraft";
import { format } from "../api/common";
import { send } from "../api/message";
import { getScore, setScore } from "../api/scoreboard";

const getCoolResetText = (skillNumber: number) => {
	return format("스킬 {0}의 쿨타임이 회복되었습니다", [skillNumber]);
};

const onTick = () => {
	for(const player of world.getPlayers()) {
		try {
			let cool = getScore(player, "cool1");
			if(cool > 0) {
				setScore(player, "cool1", cool - 1, true);

				if(cool === 1) {
					send(player, getCoolResetText(1));
				}
			}
			
			cool = getScore(player, "cool2");
			if (cool > 0) {
				setScore(player, "cool2", cool - 1, true);

				if (cool === 1) {
					send(player, getCoolResetText(2));
				}
			}

			cool = getScore(player, "cool3");
			if (cool > 0) {
				setScore(player, "cool3", cool - 1, true);

				if (cool === 1) {
					send(player, getCoolResetText(3));
				}
			}

			cool = getScore(player, "cool4");
			if (cool > 0) {
				setScore(player, "cool4", cool - 1, true);

				if (cool === 1) {
					send(player, getCoolResetText(4));
				}
			}
		} catch(e) {
			continue;
		}
	}
};

const onSec = () => {
	for(const player of world.getPlayers()) {
		try {
			let currentStat = getScore(player, "hp");
			let maxStat = getScore(player, "maxhp");
			if(currentStat < maxStat) {
				const hpRegen = getScore(player, "hpRegen");
				setScore(player, "hp", Math.min(currentStat + hpRegen, maxStat), true);
			}

			currentStat = getScore(player, "mn");
			maxStat = getScore(player, "maxmn");
			if(currentStat < maxStat) {
				const mnRegen = getScore(player, "mnRegen");
				setScore(player, "mn", Math.min(currentStat + mnRegen, maxStat), true);
			}
		} catch(e) {
			continue;
		}
	}
};

world.events.tick.subscribe(event => {
	const { currentTick } = event;

	onTick();

	if(currentTick % 20 === 0) {
		onSec();
	}
});