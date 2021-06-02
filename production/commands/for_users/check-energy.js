const { maxEnergy, completionEnergy } = require('../../config.json');

module.exports = {
	name: 'energy',
	description: 'Returns how much energy the user currently has',
	cooldown: 5,
	execute(message) {
        const { energyUsers, importantChannels } = message.client;
		const botReplyCID = importantChannels.get('botReplyCID');
        
        message.delete()
            .then(msg => console.log(`Deleted message from ${msg.author.username}`))
            .catch(console.error);

        const notTrackedMsg = 'Somehow you are not being tracked for energy';
        if (!energyUsers.has(message.author)) {            
            message.author.send(notTrackedMsg).catch(() => {
				message.client.channels.cache.get(botReplyCID).send(`${message.author} ${notTrackedMsg}\nAllow DMs from server members to get private bot responses.`);
			});            
        }
        else {
            const currEnergy = energyUsers.get(message.author);
            const currentEnergyMsg = `You currently have ${currEnergy} / ${maxEnergy} energy. It takes ${completionEnergy} energy to use the !continue command.`;
            message.author.send(currentEnergyMsg).catch(() => {
				message.client.channels.cache.get(botReplyCID).send(`${message.author} ${currentEnergyMsg}\nAllow DMs from server members to get private bot responses.`);
			});
        }
	},
};