import { Player } from "mojang-minecraft";
import { send } from "../../api/message";
import { getScore, Score, setScore } from "../../api/scoreboard";
import { Job, JobEvent } from "../job";
import { checkCoolAndMn, minusStat, resetScore } from "../jobApi";

export class IceMagician extends Job {
	initStat(player: Player): void {
		setScore(player, Score.maxhp, 2000);
		setScore(player, Score.maxmn, 200);
		setScore(player, Score.hpRegen, 7);
		setScore(player, Score.mnRegen, 10);

		setScore(player, Score.baseCool1, 50);
		setScore(player, Score.baseCool2, 100);
		setScore(player, Score.baseCool3, 150);
		setScore(player, Score.baseCool4, 400);

		resetScore(player);
	}

	beforeExecute1(player: Player): string | null {
		return checkCoolAndMn(player, 1, 30);
	}

	beforeExecute2(player: Player): string | null {
		return checkCoolAndMn(player, 2, 50);
	}

	beforeExecute3(player: Player): string | null {
		return checkCoolAndMn(player, 3, 70);
	}

	beforeExecute4(player: Player): string | null {
		return checkCoolAndMn(player, 4, 100);
	}

	execute1(player: Player): void {
		setScore(player, Score.cool1, getScore(player, Score.baseCool1));
		minusStat(player, 30, Score.mn, Score.maxmn);

		const view = player.viewVector;
		send(player, `${view.x} ${view.y} ${view.z}`);
	}

	execute2(player: Player): void {
		setScore(player, Score.cool2, getScore(player, Score.baseCool2));
		minusStat(player, 50, Score.mn, Score.maxmn);

		send(player, "s2");
	}

	execute3(player: Player): void {
		setScore(player, Score.cool3, getScore(player, Score.baseCool3));
		minusStat(player, 70, Score.mn, Score.maxmn);

		send(player, "s3");
	}

	execute4(player: Player): void {
		setScore(player, Score.cool4, getScore(player, Score.baseCool4));
		minusStat(player, 100, Score.mn, Score.maxmn);

		send(player, "s4");
	}

	triggerEvent(event: JobEvent): void {
		if (event !== JobEvent.DESPAWN_PROJECTILE) {
			return;
		}
	}
}
