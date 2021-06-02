const Discord = require('discord.js'); 

module.exports = {
	name: 'init-story',
	description: 'Initialize a channel to become a story channel where the !continue command is available.',
	cooldown: 1,
    permissions: 'ADMINISTRATOR',
	execute(message, args) {
		let memberArrayCap = 5;
		if (args.length) {
			memberArrayCap = args[0];
		}

		const memberCollection = new Discord.Collection();
		memberCollection.set(memberArrayCap, new Array());

		message.client.storyChannels.set(message.channel, memberCollection);
		
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