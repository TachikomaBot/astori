module.exports = {
	name: 'init-reply',
	description: 'Initialize channel for bot reply to user bot commands when they cannot be DMed',
	cooldown: 5,
    permissions: 'ADMINISTRATOR',
	execute(message, args) {
        const { importantChannels } = message.client;

        importantChannels.set('botReplyCID', message.channel.id);
		
        message.client.channels.fetch(message.channel.id)
        .then(channel => console.log(`Using ${channel.name} to reply to user commands when DMs are disabled.`))
        .catch(console.error);

        message.delete()
			.then(msg => console.log(`Deleted message from ${msg.author.username}`))
			.catch(console.error);
	},
};