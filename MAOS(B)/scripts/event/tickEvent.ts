import { world } from "mojang-minecraft";
import { format } from "../api/common";
import { send } from "../api/message";
import { getScore, Score, setScore } from "../api/scoreboard";

const getCoolResetText = (skillNumber: number) => {
	return format("스킬 {0}의 쿨타임이 회복되었습니다", [skillNumber]);
};

const onTick = () => {
	for(const player of world.getPlayers()) {
		try {
			let cool = getScore(player, Score.cool1);
			if(cool > 0) {
				setScore(player, Score.cool1, cool - 1);

				if(cool === 1) {
					send(player, getCoolResetText(1));
				}
			}
			
			cool = getScore(player, Score.cool2);
			if (cool > 0) {
				setScore(player, Score.cool2, cool - 1);

				if (cool === 1) {
					send(player, getCoolResetText(2));
				}
			}

			cool = getScore(player, Score.cool3);
			if (cool > 0) {
				setScore(player, Score.cool3, cool - 1);

				if (cool === 1) {
					send(player, getCoolResetText(3));
				}
			}

			cool = getScore(player, Score.cool4);
			if (cool > 0) {
				setScore(player, Score.cool4, cool - 1);

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
			let currentStat = getScore(player, Score.hp);
			let maxStat = getScore(player, Score.maxhp);
			if(currentStat < maxStat) {
				const hpRegen = getScore(player, Score.hpRegen);
				setScore(player, Score.hp, Math.min(currentStat + hpRegen, maxStat));
			}

			currentStat = getScore(player, Score.mn);
			maxStat = getScore(player, Score.maxmn);
			if(currentStat < maxStat) {
				const mnRegen = getScore(player, Score.mnRegen);
				setScore(player, Score.mn, Math.min(currentStat + mnRegen, maxStat));
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