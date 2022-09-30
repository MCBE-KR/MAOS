import { Entity } from "mojang-minecraft";
import { getScore, Score, setScore } from "./scoreboard";

interface IAddBuff {
	entity: Entity | Entity[];
	tick: number;
	canStack?: boolean;
}

export const BUFF_TAG = "buff";
export const BUFF_TAG_LENGTH = BUFF_TAG.length + 1;

export const buffDatas: {
	[buff in Score]?: {
		buffTick: number;
		getBuffVariable: (entity: Entity) => any;
		getBuffAction: (entity: Entity, buffVariables: any) => void;
	};
} = {
	stun: {
		buffTick: 1,
		getBuffVariable: (entity) => {
			return {
				location: entity.location,
				rotation: entity.rotation,
				dimension: entity.dimension,
			};
		},
		getBuffAction: (entity, buffVariables) => {
			const { location, rotation, dimension } = buffVariables;
			entity.teleport(location, dimension, rotation.x, rotation.y, false);
		},
	},
};

const addBuff = (entity: Entity, buff: Score) => {
	entity.addTag(BUFF_TAG);
	entity.addTag(`${BUFF_TAG}_${buff}`);
};

export const addStun = ({ entity, tick, canStack = false }: IAddBuff) => {
	return new Promise(() => {
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
	});
};
