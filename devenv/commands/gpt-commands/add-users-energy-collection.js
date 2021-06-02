module.exports = {
	name: 'add-enecoll',
	description: 'Check all users on the server to find users not tracked for energy and add',
	cooldown: 30,
    permissions: 'ADMINISTRATOR',
	async execute(message, args) {	
        const { energyUsers } = message.client;		

        message.delete().then(msg => {
            console.log(`Deleted message from ${msg.author.username}`);
            
            message.guild.members.cache.forEach((_guildMember, _snowflake) => {
                console.log(`guild member: ${_guildMember.user.tag}`);
                if (!energyUsers.has(_guildMember.user)) {
                    console.log(`Existing user ${_guildMember.user.tag} (using command for first time) added to energy collection`);
                    energyUsers.set(_guildMember.user, 240);
                }
            });
            
        });  
	},
};