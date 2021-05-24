const Discord = require('discord.js'); 

module.exports = {
	name: 'init-story',
	description: 'Initialize the story channel for !continue command.',
    permissions: 'ADMINISTRATOR',
	execute(message, args) {
		let arrCap = 5;
		if (args.length) {
			arrCap = args[0];
		}

		const coll = new Discord.Collection();
		coll.set(arrCap, new Array());

		message.client.storyChannels.set(message.channel, coll);
		
        message.client.channels.fetch(message.channel.id)
        .then(channel => console.log(`Listening to ${channel.name} for story completion.`))
        .catch(console.error);

        message.delete()
		.then(() => {
			let roleExists = false;
			message.guild.roles.cache.forEach(role => {
				if (role.name === message.channel.name) {
					roleExists = true;
				}
			});

			if (!roleExists) {
				message.guild.roles.create({
					data: {
						name: message.channel.name,
						color: 'BLUE',
					},
					reason: 'new role to write to this story channel',
					})
					.then(newRole => {
						message.channel.overwritePermissions(
						[
							{
								id: newRole,
								allow: ['SEND_MESSAGES'],
							},
							{
								id: message.channel.guild.roles.everyone,
								deny: ['SEND_MESSAGES'],
							},
						], 
						'Needed to change permissions')
						.catch(console.error);
					})		
					.catch(console.error);
			}
		})
		.catch(console.error);
	},
};