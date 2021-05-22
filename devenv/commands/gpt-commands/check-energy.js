const { maxEnergy, completionEnergy } = require('../../config.json');

module.exports = {
	name: 'energy',
	description: 'Returns how much energy the user currently has',
	cooldown: 5,
	execute(message) {
        const { energyUsers } = message.client;
        
        message.delete()
            .then(msg => console.log(`Deleted message from ${msg.author.username}`))
            .catch(console.error);

        if (!energyUsers.has(message.author)) {            
            message.author.send('Somehow you are not being tracked for energy');            
        }
        else {
            const currEnergy = energyUsers.get(message.author);
            message.author.send(`You currently have ${currEnergy} / ${maxEnergy} energy. It takes ${completionEnergy} energy to use the !continue command.`);
        }
	},
};