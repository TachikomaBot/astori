const utilities = require('../utilities.js');

const { prefix } = require('../config.json');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client, keyv) {
        if (newMessage.content.startsWith(prefix) || newMessage.author.bot) return;
        
		// const storyChannelID = await keyv.get('storyChannelID');
        const storyChannels = newMessage.client.storyChannels;

        console.log('some message was edited');

        let isStoryChannel = false;

        storyChannels.filter(function(storyMembers, storyChannel) {
            console.log(`${storyChannel.id}, ${newMessage.channel.id}`);
			if (storyChannel.id === newMessage.channel.id) {
                isStoryChannel = true;
            }
		});

        if (isStoryChannel) {
            utilities.checkMessageStorySafety(newMessage, keyv);
        }
    },
};