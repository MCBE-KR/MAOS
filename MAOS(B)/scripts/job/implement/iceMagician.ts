import { Player, Vector } from "mojang-minecraft";
import { send } from "../../api/message";
import { addProjectile } from "../../api/projectile";
import { getScore, Score, setScore } from "../../api/scoreboard";
import { Job, JobEvent } from "../job";
import { addStat, checkCoolAndMn, minusStat, resetScore } from "../jobApi";

export class IceMagician extends Job {
	initStat(player: Player): void {
		setScore(player, "maxhp", 2000);
		setScore(player, "maxmn", 200);
		setScore(player, "hpRegen", 7);
		setScore(player, "mnRegen", 10);

		setScore(player, "baseCool1", 50);
		setScore(player, "baseCool2", 100);
		setScore(player, "baseCool3", 150);
		setScore(player, "baseCool4", 400);

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
		setScore(player, "cool1", getScore(player, "baseCool1"));
		minusStat(player, 30, "mn", "maxmn");

		addProjectile(
			"maos:j1s1",
			player,
			player.viewVector,
			new Vector(0, 0.8, 0),
		);
	}

	execute2(player: Player): void {
		setScore(player, "cool2", getScore(player, "baseCool2"));
		minusStat(player, 50, "mn", "maxmn");

		send(player, "s2");
	}

	execute3(player: Player): void {
		setScore(player, "cool3", getScore(player, "baseCool3"));
		minusStat(player, 70, "mn", "maxmn");

		send(player, "s3");
	}

	execute4(player: Player): void {
		setScore(player, "cool4", getScore(player, "baseCool4"));
		minusStat(player, 100, "mn", "maxmn");

		send(player, "s4");
	}

	triggerEvent(event: JobEvent, player?: Player): void {
		if (event !== JobEvent.DESPAWN_PROJECTILE) {
			return;
		}

		addStat(player!, 5, "mn", "maxmn");
	}
}
