export const format = (str: string, args: any[]) => {
	let i = 0;
	let result = str;
	for (const arg of args) {
		result = result.split(`{${i++}}`).join(arg);
	}

	return result;
};