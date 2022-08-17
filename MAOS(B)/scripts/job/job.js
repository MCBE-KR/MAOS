import { format } from "../api/common";
import { send } from "../api/message";
import { getScore, Score, setScore } from "../api/scoreboard";
export var JobEvent;
(function (JobEvent) {
    JobEvent[JobEvent["DESPAWN_PROJECTILE"] = 0] = "DESPAWN_PROJECTILE";
})(JobEvent || (JobEvent = {}));
export const SkillFailReason = {
    COOL_REMAIN: "§c스킬 {0} 쿨타임: [§l{1}/{2}§r§c]",
    REQUIRES_MN: "§b스킬 {0} 마나: [§l{1}/{2}§r§b]",
};
export class Job {
    constructor() {
        this.getSkill = (skillNumber) => {
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
        };
    }
}
export const getJob = (player) => {
    return JOBS[getScore(player, Score.job)];
};
export const setJob = (player, jobId) => {
    const job = JOBS[jobId];
    if (!job) {
        throw new Error(`Unknown jobId - ${jobId}`);
    }
    setScore(player, Score.job, jobId);
    job.initStat(player);
};
const addStat = (player, stat, objectiveId, maxObjectiveId) => {
    const currentStat = getScore(player, objectiveId);
    if (currentStat < -stat) {
        console.warn(`Stat is minus - ${objectiveId} ${currentStat} ${stat}`);
        return;
    }
    const maxStat = getScore(player, maxObjectiveId);
    const resultStat = Math.min(currentStat + stat, maxStat);
    setScore(player, objectiveId, resultStat);
};
const checkCool = (player, skillNumber) => {
    let baseObjectiveId;
    let objectiveId;
    switch (skillNumber) {
        case 1:
            baseObjectiveId = Score.baseCool1;
            objectiveId = Score.cool1;
            break;
        case 2:
            baseObjectiveId = Score.baseCool2;
            objectiveId = Score.cool2;
            break;
        case 3:
            baseObjectiveId = Score.baseCool3;
            objectiveId = Score.cool3;
            break;
        case 4:
            baseObjectiveId = Score.baseCool4;
            objectiveId = Score.cool4;
            break;
        default:
            throw new Error(`Unknown skill number - ${skillNumber}`);
    }
    const cool = getScore(player, objectiveId);
    const success = cool === 0;
    if (!success) {
        const baseCool = getScore(player, baseObjectiveId);
        return format(SkillFailReason.COOL_REMAIN, [skillNumber, cool / 20, baseCool / 20]);
    }
    return null;
};
const checkMn = (player, skillNumber, mn) => {
    const success = getScore(player, Score.mn) >= mn;
    if (!success) {
        const currentMn = getScore(player, Score.mn);
        return format(SkillFailReason.REQUIRES_MN, [skillNumber, currentMn, -mn]);
    }
    return null;
};
const checkCoolAndMn = (player, skillNumber, mn) => {
    const coolMessage = checkCool(player, skillNumber);
    if (coolMessage) {
        return coolMessage;
    }
    return checkMn(player, skillNumber, mn);
};
const resetScore = (player) => {
    setScore(player, Score.hp, getScore(player, Score.maxhp));
    setScore(player, Score.mn, getScore(player, Score.maxmn));
    setScore(player, Score.cool1, 0);
    setScore(player, Score.cool2, 0);
    setScore(player, Score.cool3, 0);
    setScore(player, Score.cool4, 0);
};
class IceMagician extends Job {
    initStat(player) {
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
    beforeExecute1(player) {
        return checkCoolAndMn(player, 1, -30);
    }
    beforeExecute2(player) {
        return checkCoolAndMn(player, 2, -50);
    }
    beforeExecute3(player) {
        return checkCoolAndMn(player, 3, -70);
    }
    beforeExecute4(player) {
        return checkCoolAndMn(player, 4, -100);
    }
    execute1(player) {
        setScore(player, Score.cool1, getScore(player, Score.baseCool1));
        addStat(player, -30, Score.mn, Score.maxmn);
        send(player, "s1");
    }
    execute2(player) {
        setScore(player, Score.cool2, getScore(player, Score.baseCool2));
        addStat(player, -50, Score.mn, Score.maxmn);
        send(player, "s2");
    }
    execute3(player) {
        setScore(player, Score.cool3, getScore(player, Score.baseCool3));
        addStat(player, -70, Score.mn, Score.maxmn);
        send(player, "s3");
    }
    execute4(player) {
        setScore(player, Score.cool4, getScore(player, Score.baseCool4));
        addStat(player, -100, Score.mn, Score.maxmn);
        send(player, "s4");
    }
    triggerEvent(event) {
        if (event !== JobEvent.DESPAWN_PROJECTILE) {
            return;
        }
    }
}
export const JOBS = {
    1: new IceMagician(),
};
