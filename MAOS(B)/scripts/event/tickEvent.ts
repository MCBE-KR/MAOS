import { Entity, world } from "mojang-minecraft";
import { buffDatas, BUFF_TAG, BUFF_TAG_LENGTH } from "../api/buff";
import { format, getIdentifier } from "../api/common";
import { send } from "../api/message";
import { getScore, Score, setScore, syncMn } from "../api/scoreboard";
import { OVERWORLD } from "../common/constants";

const entityBuffVariables: {
	[identifier: string]: {
		[buff in Score]?: {
			recentTick: number;
			variables: any;
		}
	};
} = {};

const getCoolResetText = (skillNumber: number) => {
	return format("스킬 {0}의 쿨타임이 회복되었습니다", [skillNumber]);
};

const executeBuffs = (currentTick: number, entity: Entity) => {
	let removedTagCount = 0;
	const buffTags = entity
		.getTags()
		.filter((tag) => tag.startsWith(`${BUFF_TAG}_`));

	const identifier = getIdentifier(entity);

	let entityBuffVariable = entityBuffVariables[identifier];
	if(!entityBuffVariable) {
		entityBuffVariable = {};
		entityBuffVariables[identifier] = {};
	}

	for (const tag of buffTags) {
		const buff = tag.substring(BUFF_TAG_LENGTH) as Score;
		const score = getScore(entity, buff);
		const { buffTick, getBuffAction, getBuffVariable } = buffDatas[buff]!;
		
		let buffVariable = entityBuffVariable[buff];
		if(!buffVariable) {
			buffVariable = {
				recentTick: currentTick,
				variables: getBuffVariable(entity)
			};

			if(score !== 1) {
				entityBuffVariable[buff] = buffVariable;
			}
		}

		const { recentTick, variables } = buffVariable;
		if((currentTick - recentTick) % buffTick === 0) {
			buffVariable.recentTick = currentTick;
			getBuffAction(entity, variables);
		}

		setScore(entity, buff, score - 1, true);

		if (score === 1) {
			entity.removeTag(tag);
			delete entityBuffVariables[identifier];

			if (buffTags.length === ++removedTagCount) {
				entity.removeTag(BUFF_TAG);
			}
		}
	}
};

const onTick = (currentTick: number) => {
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

			executeBuffs(currentTick, player);
		} catch(e) {
			continue;
		}
	}

	const entities = OVERWORLD.getEntities({
		excludeTypes: ["minecraft:player"],
		tags: [BUFF_TAG]
	});

	for(const entity of entities) {
		try {
			executeBuffs(currentTick, entity);
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

				setScore(player, "mn", Math.min(currentStat + mnRegen, maxStat), true)
					?.then(() => syncMn(player, currentStat + mnRegen));
			}
		} catch(e) {
			continue;
		}
	}
};

world.events.tick.subscribe(event => {
	const { currentTick } = event;

	onTick(currentTick);

	if(currentTick % 20 === 0) {
		onSec();
	}
});