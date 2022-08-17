import { world } from "mojang-minecraft";
const SCOREBOARD = world.scoreboard;
export const Score = {
    job: "job",
    maxhp: "maxhp",
    hp: "hp",
    maxmn: "maxmn",
    mn: "mn",
    hpRegen: "hpRegen",
    mnRegen: "mnRegen",
    baseCool1: "baseCool1",
    baseCool2: "baseCool2",
    baseCool3: "baseCool3",
    baseCool4: "baseCool4",
    cool1: "cool1",
    cool2: "cool2",
    cool3: "cool3",
    cool4: "cool4",
};
export const getScore = (entity, objectiveId) => {
    return SCOREBOARD.getObjective(objectiveId).getScore(entity.scoreboard);
};
export const setScore = (entity, objectiveId, value) => {
    entity.runCommand(`scoreboard players set @s ${objectiveId} ${value}`);
};
