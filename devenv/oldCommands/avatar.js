// const Discord = require('discord.js');

module.exports = {
	name: 'avatar',
	description: 'Gets the user\'s avatar',
    usage: '<user> <role>',
    aliases: ['icon', 'pfp'],
	execute(message, args) {
		if (!args.size) {
            // const exampleEmbed = new Discord.MessageEmbed()
            //    .setImage(message.author.displayAvatarURL({ format: 'png', dynamic: true }));
            
            // return message.channel.send(exampleEmbed);
            return message.channel.send(`Your avatar: <${message.author.displayAvatarURL({ format: 'png', dynamic: true })}>`);
        }
    
        const avatarList = args.map(user => {
            return `${user.username}'s avatar: <${user.displayAvatarURL({ format: 'png', dynamic: true })}>`;
        });
    
        // send the entire array of strings as a message
        // by default, discord.js will `.join()` the array with `\n`
        message.channel.send(avatarList);
	},
};