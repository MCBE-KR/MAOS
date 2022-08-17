export const send = (player, message) => {
    const messageObject = {};
    if (typeof message === "string") {
        messageObject.rawtext = [{
                text: message
            }];
    }
    else {
        messageObject.rawtext = message;
    }
    player.runCommand(`tellraw @s ${JSON.stringify(messageObject)}`);
};
