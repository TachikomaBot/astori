const { maxEnergy } = require('../../config.json');

module.exports = {
	name: 'add-energy',
	description: 'Add energy to user',
	cooldown: 0,
	args: true,
    permissions: 'ADMINISTRATOR',
	async execute(message, args) {		
        const { energyUsers } = message.client;

		const paymentAmnt = Number(args[0]) * 100;
		const paymentTag = args[1];
		
		const filteredUsers = energyUsers.filter((currEnergy, user) => user.tag == paymentTag);
		console.log(`filtered users?: ${filteredUsers}`);

		if (filteredUsers) {
			filteredUsers.each((energy, user) => {
				let newEnergy = energyUsers.get(user) + paymentAmnt;
				if (newEnergy > maxEnergy) {
					newEnergy = maxEnergy;
				}
				energyUsers.set(user, newEnergy);
				console.log(`Paid Energy gained, user: ${user.tag}, new energy: ${newEnergy}`);
				message.channel.send(`${paymentTag} paid for ${paymentAmnt} energy, current energy is ${newEnergy}.`);
			});
		}
		else {
			message.channel.send(`No user by the tag ${paymentTag} was found.`);
		}
	},
};