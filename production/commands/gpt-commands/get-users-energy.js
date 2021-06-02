module.exports = {
	name: 'get-users-energy',
	description: 'Get the energy for one user, or all users',
	cooldown: 5,
    permissions: 'ADMINISTRATOR',
    usage: '[user tag (ex. Tachikoma#7350)]',
	async execute(message, args) {
        if (!args.length) {
            message.client.energyUsers.forEach((_currEnergy, _energyUser) => {
                // console.log(`energy user ${_energyUser.tag} has ${_currEnergy}`);
                message.channel.send(`User ${_energyUser.tag} currently has ${_currEnergy} energy.`);
            });
        }
        else {
            const userTag = args[0];

            const guildMember = message.guild.members.cache.find((_guildMember, _snowflake) => _guildMember.user.tag === userTag);

            if (guildMember) {
                const currEnergy = message.client.energyUsers.get(guildMember.user);
    
                // console.log(`energy user ${guildMember.user.tag} has ${currEnergy}`);
                message.channel.send(`User ${guildMember.user.tag} currently has ${currEnergy} energy.`);
            }
            else {
                // console.log(`Could not find user with tag ${userTag}`);
                message.channel.send(`Could not find user with tag ${userTag}`);
            }
        }
	},
};