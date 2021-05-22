// const { dumpChannelIDKey } = require('../../config.json');

module.exports = {
	name: 'init-dump',
	description: 'Initialize dump channel for bot to post unsafe posts and their author',
    // permissions: 'ADMINISTRATOR',
	async execute(message, args, keyv) {        
        await keyv.set('dumpChannelID', message.channel.id);
		
        message.client.channels.fetch(message.channel.id)
        .then(channel => console.log(`Using ${channel.name} to dump unsafe posts.`))
        .catch(console.error);

        message.delete()
			.then(msg => console.log(`Deleted message from ${msg.author.username}`))
			.catch(console.error);
	},
};