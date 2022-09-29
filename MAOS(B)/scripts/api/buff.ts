import { Entity, TickEvent, world } from "mojang-minecraft";
import { OVERWORLD } from "../common/constants";
import { addTask } from "./asynchronous";
import { buffActions, getScore, Score, setScore } from "./scoreboard";

interface IAddBuff {
	entity: Entity | Entity[];
	tick: number;
	canStack?: boolean;
}

export const BUFF_TAG = "buff_";

const BUFF_TICK = 10;
const BUFF_TAG_LENGTH = BUFF_TAG.length;

const buffTickEvent = (event: TickEvent) => {
	if (event.currentTick % BUFF_TICK !== 0) {
		return;
	}

	const entities = OVERWORLD.getEntities({
		tags: [BUFF_TAG],
	});

	let iterated = false;
	for (const entity of entities) {
		iterated = true;
		
		const tags = entity
			.getTags()
			.filter((tag) => tag.startsWith(`${BUFF_TAG}`));

		for (const tag of tags) {
			const buff = tag.substring(BUFF_TAG_LENGTH) as Score;
			const score = getScore(entity, buff);

			const action = buffActions[buff];
			if(action) {
				action(entity);
			}

			if (score <= BUFF_TICK) {
				addTask(score, () => {
					entity.removeTag(tag);
				});
			}
		}
	}

	if(!iterated) {
		world.events.tick.unsubscribe(buffTickEvent);
	}
};

const addBuff = (entity: Entity, buff: Score) => {
	entity.addTag(BUFF_TAG);
	entity.addTag(`${BUFF_TAG}${buff}`);
};

export const addStun = async ({ entity, tick, canStack = false }: IAddBuff) => {
	await new Promise(() => {
		const addStunToEntity = (target: Entity) => {
			const currentScore = getScore(target, "stun");
			const newScore = canStack
				? currentScore + tick
				: Math.max(currentScore, tick);

			setScore(target, "stun", newScore, true);
			addBuff(target, "stun");
		};

		if (Array.isArray(entity)) {
			for (const target of entity) {
				addStunToEntity(target);
			}
		} else {
			addStunToEntity(entity);
		}

		world.events.tick.subscribe(buffTickEvent);
	});
};
