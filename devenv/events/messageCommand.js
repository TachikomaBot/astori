// const Discord = require('discord.js');
// const cdRemaining = require('../commands/gpt-commands/cd-remaining');
// const { stringInput } = require('../commands/prompt/prompt');
const { prefix } = require('../config.json');
const utilities = require('../utilities.js');

module.exports = {
    name: 'message',
    async execute(message, client) {
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName)
            || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        if (command.guildOnly && message.channel.type === 'dm') {
            return message.reply('I can\'t execute that command inside DMs!');
        }

        if (command.permissions) {
            const authorPerms = message.channel.permissionsFor(message.author);
            if (!authorPerms || !authorPerms.has(command.permissions)) {
                message.delete()
                    .then(msg => console.log(`Deleted message from ${msg.author.username}`))
                    .catch(console.error);
                return message.reply('You can not do this!');
            }
        }

        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }

            return message.channel.send(reply);
        }

        const { energyUsers } = client;

        if (!energyUsers.has(message.author)) {
            console.log('Existing user (using command for first time) added to energy collection');
            energyUsers.set(message.author, 100);
        }

        const cooldownAmount = (command.cooldown || 1) * 1000;
        const isAlreadyOnCD = utilities.timeoutUser(client, command, message, cooldownAmount, true);

        if (!isAlreadyOnCD) {
            try {
                console.log(`execute ${message}`);
                command.execute(message, args);
            }
            catch (error) {
                console.error(error);
                message.reply('there was an error trying to execute that command!');
            }
        }
    },
};