const utilities = require('../utilities.js');

const { prefix } = require('../config.json');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (newMessage.content.startsWith(prefix) || newMessage.author.bot) return;
        
        // console.log('some message was edited');

        let isStoryChannel = false;

        newMessage.client.storyChannels.filter(function(storyMembers, storyChannel) {
            // console.log(`${storyChannel.id}, ${newMessage.channel.id}`);
			if (storyChannel.id === newMessage.channel.id) {
                isStoryChannel = true;
            }
		});

        if (isStoryChannel) {
            utilities.checkMessageStorySafety(newMessage);
        }
    },
};