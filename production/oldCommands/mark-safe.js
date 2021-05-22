module.exports = {
	name: 'safe',
	description: 'Marks the story channel as safe for use of the !continue command again.',
    // permissions: 'ADMINISTRATOR',
	execute(message, args) {        
		/* const { globalVars } = message.client;
        
        const isNotStory = globalVars.get('isNotStory');
        
        if (isNotStory) {
            globalVars.set('isNotStory', false);
            message.author.send('The story channel has been marked as safe, the !continue command is available for use.');
        }
        else {
            message.author.send('The story channel is already safe, the !continue command is available for use.');
        }

        message.delete()
			.then(msg => console.log(`Deleted message from ${msg.author.username}`))
			.catch(console.error);*/
	},
};