module.exports = {
	name: 'kick',
	description: 'Kicks a user',
    guildOnly: true,
    permissions: 'KICK_MEMBERS',
	execute(message, args) {
		if (args[0] === 'foo') {
			return message.channel.send('bar');
		}

		message.channel.send('kick?');
	},
};