const fs = require('fs');

module.exports = {
	name: 'add-energy',
	description: 'Add energy to user',
	cooldown: 2,
	args: true,
	async execute(message, args) {		
        const { energyUsers } = message.client;

        // const paymentData = message.content.split(' ');
		// const paymentAmnt = paymentData[1];
		const paymentTag = args[1];
		
		const filteredUsers = energyUsers.filter((currEnergy, user) => user.tag == paymentTag);

		if (filteredUsers) {
			filteredUsers.each((energy, user) => {
				const newEnergy = energyUsers.get(user) + 100;
				energyUsers.set(user, newEnergy);
				console.log(`Paid Energy gained, user: ${user.tag}, new energy: ${newEnergy}`);
				message.channel.send(`${paymentTag} gained 100 energy.`);
			});
		}
		else {
			message.channel.send(`No user by the tag ${paymentTag} was found.`);
		}
	},
};