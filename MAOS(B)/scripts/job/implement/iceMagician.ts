import { Player } from "mojang-minecraft";
import { send } from "../../api/message";
import { addProjectile } from "../../api/projectile";
import { setScore, syncMn } from "../../api/scoreboard";
import { Job } from "../job";
import { checkCoolAndMn, minusMn, resetScore, setCoolToBase } from "../jobApi";

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
		setCoolToBase(player, 1);
		minusMn(player, 30);
		syncMn(player);

		addProjectile("maos:j1s1", player, player.viewVector);
	}

	execute2(player: Player): void {
		setCoolToBase(player, 2);
		minusMn(player, 50);
		syncMn(player);

		addProjectile("maos:j1s2", player, player.viewVector);
	}

	execute3(player: Player): void {
		setCoolToBase(player, 3);
		minusMn(player, 70);
		syncMn(player);

		send(player, "s3");
	}

	execute4(player: Player): void {
		setCoolToBase(player, 4);
		minusMn(player, 100);
		syncMn(player);

		send(player, "s4");
	}
}
