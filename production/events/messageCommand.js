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
                return message.reply(`You don/'t have the permissions to use the command: ${command.name}`);
            }
        }

        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }

            return message.channel.send(reply);
        }

        const { energyUsers, importantChannels } = client;

        if (!energyUsers.has(message.author)) {
            console.log('Existing user (using command for first time) added to energy collection');
            energyUsers.set(message.author, 240);
        }

        if (commandName != 'continue') {
            let isStoryChannel = false;
		
            const botReplyCID = importantChannels.get('botReplyCID');
    
            message.client.storyChannels.filter(function(storyMembers, storyChannel) {
                console.log(`${storyChannel.id}, ${message.channel.id}`);
                if (storyChannel.id === message.channel.id) {
                    isStoryChannel = true;
                }
            });

            if (isStoryChannel) {
                const wrongChannelMsg = 'Do not use bot commands other than !continue in a story channel.';
                message.author.send(wrongChannelMsg).catch(() => {
                    message.client.channels.cache.get(botReplyCID).send(`${message.author} ${wrongChannelMsg}\nAllow DMs from server members to get private bot responses.`);
                });

                message.delete()
                .then(msg => console.log(`Deleted message from ${msg.author.username}`))
                .catch(console.error);
                return;
            }
        }

        // const cooldownAmount = (command.cooldown || 1) * 1000;
        let isAlreadyOnCD = false;
        if (command.cooldown > 0) {
            isAlreadyOnCD = utilities.timeoutUser(client, command, message, command.cooldown * 1000, true);
        }

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