const utilities = require('../../utilities.js');

module.exports = {
	name: 'cd-time-left',
	description: 'Get how much longer a user must wait before a command is available to use again.',
    usage: '[command name]',
	args: true,
	cooldown: 10,
	execute(message, args) {
		const { importantChannels } = message.client;
		const botReplyCID = importantChannels.get('botReplyCID');

        const commandName = args[0].toLowerCase();

		const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		const noCommandMsg = `There is no command with name or alias \`${commandName}\`, ${message.author}!`;
		if (!command) {
			return message.author.send(noCommandMsg).catch(() => {
				message.client.channels.cache.get(botReplyCID).send(`${message.author} ${noCommandMsg}\nAllow DMs from server members to get private bot responses.`);
			});
		}
		
		const cooldownAmount = (command.cooldown || 1) * 1000;
		
        const isAlreadyOnCD = utilities.timeoutUser(message.client, command, message, cooldownAmount);

		const cdOverMsg = `The cooldown for command ${commandName} is over.`;
		if (!isAlreadyOnCD) {
			message.author.send(cdOverMsg).catch(() => {
				message.client.channels.cache.get(botReplyCID).send(`${message.author} ${cdOverMsg}\nAllow DMs from server members to get private bot responses.`);
			});
		}
	},
};