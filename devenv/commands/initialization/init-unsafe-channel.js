module.exports = {
	name: 'init-unsafe',
	description: 'Initialize channel for bot to post unsafe posts and their author',
	cooldown: 5,
    permissions: 'ADMINISTRATOR',
	async execute(message, args) {        
        const { importantChannels } = message.client;
        importantChannels.set('unsafeCID', message.channel.id);
		
        message.client.channels.fetch(message.channel.id)
        .then(channel => console.log(`Using ${channel.name} to post unsafe user posts.`))
        .catch(console.error);

        message.delete()
			.then(msg => console.log(`Deleted message from ${msg.author.username}`))
			.catch(console.error);
	},
};