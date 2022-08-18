import { Player } from "mojang-minecraft";

const jobEvents = [
	"DESPAWN_PROJECTILE"
] as const;
export type JobEvent = typeof jobEvents[number];

export const SkillFailReason = {
	COOL_REMAIN: "§c스킬 {0} 쿨타임: [§l{1}/{2}§r§c]",
	REQUIRES_MN: "§b스킬 {0} 마나: [§l{1}/{2}§r§b]",
};

export abstract class Job {
	abstract initStat(player: Player): void;

	abstract beforeExecute1(player: Player): null | string;
	abstract beforeExecute2(player: Player): null | string;
	abstract beforeExecute3(player: Player): null | string;
	abstract beforeExecute4(player: Player): null | string;

	abstract execute1(player: Player): void;
	abstract execute2(player: Player): void;
	abstract execute3(player: Player): void;
	abstract execute4(player: Player): void;

	getSkill = (
		skillNumber: number,
	): [(player: Player) => null | string, (player: Player) => void] => {
		switch (skillNumber) {
			case 1:
				return [this.beforeExecute1, this.execute1];

			case 2:
				return [this.beforeExecute2, this.execute2];

			case 3:
				return [this.beforeExecute3, this.execute3];

			case 4:
				return [this.beforeExecute4, this.execute4];

			default:
				throw new Error("Undefined skill");
		}
	}
}