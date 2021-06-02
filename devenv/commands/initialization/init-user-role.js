const Discord = require('discord.js'); 
const allRoleNames = new Discord.Collection();
// const roleCategories = new Array();

const reactRoleListenTime = 60 * 1000;

module.exports = {
	name: 'init-user-role',
	description: 'Initialize channel with messages and reactions to allow users to self-select certain roles',
	cooldown: 5,
    permissions: 'ADMINISTRATOR',
	async execute(message, args) {	
        let msg;

        message.delete()
            .then(() => console.log(`Deleted message from ${message.author.username}`))
            .catch(console.error);
        
        const awaitMsgMsg = await message.channel.send('Notice: Listening for user directed message...');

        const filter = m => m.content.length > 0 && !m.content.includes('Notice:');
        const msgCollector = message.channel.createMessageCollector(filter, { max: 1 });

        msgCollector.on('collect', m => {
            console.log(`Collected ${m.content}`);
            msg = m;
        });

        msgCollector.on('end', async () => {
            awaitMsgMsg.delete()
                .then(() => console.log(`Deleted message from ${awaitMsgMsg.author.username}`))
                .catch(console.error);
            const awaitCatMsg = await message.channel.send('Notice: Listening for [category] [closed/open]...');

            const categoryFilter = m => m.content.length > 0 && !m.content.includes('Notice:');
            // 1 sec * 1000 ms
            const categoryCollector = message.channel.createMessageCollector(categoryFilter, { max: 1 });
            let category;
            let interaction;
            let currRoleNames;

            categoryCollector.on('collect', m => {
                const msgContent = m.content.split(' ');
                
                category = msgContent[0];
                interaction = msgContent[1];

                allRoleNames.set(category, new Discord.Collection());
                currRoleNames = allRoleNames.get(category);

                m.delete()
                .then(() => console.log(`Deleted message from ${m.author.username}`))
                .catch(console.error);
            });

            categoryCollector.on('end', async () => {                
                awaitCatMsg.delete()
                .then(() => console.log(`Deleted message from ${awaitCatMsg.author.username}`))
                .catch(console.error);
                const awaitRolesMsg = await message.channel.send(`Notice: Listening for roles for ${reactRoleListenTime / 1000} seconds [role_name] [reaction] (stop early with stop_react)...`);

                const rolesFilter = m => m.content.length > 0 && !m.content.includes('Notice:');
                // 1 sec * 1000 ms
                const rolesCollector = message.channel.createMessageCollector(rolesFilter, { time: reactRoleListenTime });

                rolesCollector.on('collect', m => {                    
                    if (m.content.includes('stop_react')) {
                        rolesCollector.stop();
                        
                        m.delete()
                        .then(() => console.log(`Deleted message from ${m.author.username}`))
                        .catch(console.error);
                    }
                    else {
                        const msgContent = m.content.split(' ');

                        const roleName = msgContent[0];
                        const roleReaction = msgContent[1];
    
                        currRoleNames.set(roleName, roleReaction);
    
                        m.delete()
                        .then(() => console.log(`Deleted message from ${m.author.username}`))
                        .catch(console.error);
    
                        msg.react(roleReaction);
                    }
                });

                rolesCollector.on('end', () => {
                    currRoleNames.forEach((roleReaction, roleName) => {
                        console.log(`Collected role: ${roleName}, reaction: ${roleReaction}`);
                        createRole(message.guild.roles, roleName);
                    });

                    awaitRolesMsg.delete()
                    .then(() => console.log(`Deleted message from ${awaitRolesMsg.author.username}`))
                    .catch(console.error);
                });

                const filterReaction = (reaction, user) => {
                    return user !== msg.author && !user.bot;
                };

                const reactionCollector = msg.createReactionCollector(filterReaction);

                reactionCollector.on('collect', (reaction, user) => {
                    msg.reactions.resolve(reaction.emoji.name).users.remove(user);

                    currRoleNames.forEach((roleReaction, roleName) => {
                        const guildRole = msg.guild.roles.cache.find(aRole => aRole.name === roleName);
                        const guildMember = msg.guild.members.cache.find(aMember => aMember.id === user.id);
                        if (reaction.emoji.name === roleReaction) {
                            let hasRole = false;
                            guildMember.roles.cache.filter(memberRole => {
                                if (memberRole.name === roleName) {
                                    // already has role, will remove
                                    hasRole = true;
                                }
                            });

                            if (!hasRole) {                                
                                guildMember.roles.add(guildRole);
                            }
                            else {                          
                                guildMember.roles.remove(guildRole);
                            }
                        }
                        else if (interaction !== 'open') {
                            guildMember.roles.remove(guildRole);
                        }
                    });                                     
                });
            });
        });
    },
};

function createRole(roles, roleName, reasonStr = '', roleColor = [255, 255, 255]) {
    let roleExists = false;
    roles.cache.forEach(role => {
        if (role.name === roleName) {
            roleExists = true;
        }
    });

    if (!roleExists) {
        roles.create({
            data: {
                name: roleName,
                color: roleColor,
            },
            reason: reasonStr,
        });
    }
}