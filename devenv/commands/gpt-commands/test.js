const fs = require('fs');

module.exports = {
	name: 'test',
	description: 'A command for test purposes',
	cooldown: 2,
	async execute(message, args, keyv) {		
		// console.log(message.member.roles.cache);

		/* 
		message.member.roles.cache.forEach(role => {
			console.log(role.name);
		});
		*/

		const res = message.member.roles.cache.filter(role => role.name === 'Admin');

		console.log(res);

		message.channel.send('This command has a long CD');
	},
};