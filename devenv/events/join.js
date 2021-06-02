module.exports = {
	name: 'guildMemberAdd',
	execute(member, client) {
        const { energyUsers } = client;
		console.log(`${member.user.tag} joined the server`);

        if (!energyUsers.has(member.user)) {
            console.log(`New user ${member.user.tag} added to energy collection`);
            energyUsers.set(member.user, 240);
        }
	},
};