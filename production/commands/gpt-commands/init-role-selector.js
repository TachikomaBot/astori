module.exports = {
	name: 'init-role-selector',
	description: 'Initialize the a channel for users to add or remove role to access story channels.',
    // permissions: 'ADMINISTRATOR',
    // args: true,
	execute(message, args) {  
        message.delete().then(msg => console.log(`Deleted message from ${msg.author.username}`));

        if (args[0]) {
            const roleName = args[0].toLowerCase();

            setupRole(message, roleName);
        }
        else {
            message.client.storyChannels.forEach((storyMembers, storyChannel) => {
                // console.log(storyChannel);
                setupRole(message, storyChannel.name);
            });
        }        
	},
};

function setupRole(message, roleName) {
    message.channel.send(`Click on the checkmark to join and contribute to the ${roleName} channel, or the X to leave it. Limit 1 user to a channel.`)
    .then(msg => {        
        msg.react('☑️');
        msg.react('❌');
        const filter = (reaction, user) => {
            return (reaction.emoji.name === '☑️' || reaction.emoji.name === '❌') && !user.bot;
        };
        
        const collector = msg.createReactionCollector(filter);

        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);

            const role = msg.guild.roles.cache.find(aRole => aRole.name === roleName);
            const member = msg.guild.members.cache.find(aMember => aMember.id === user.id);

            const storyChannels = message.client.storyChannels;

            let hasRole = false;

            member.roles.cache.filter(memberRole => {
                storyChannels.forEach(storyChannel => {
                    if (storyChannel.name === memberRole.name) {
                        hasRole = true;
                    }
                });
            });

            if (reaction.emoji.name === '☑️') {      
                msg.reactions.resolve('☑️').users.remove(user);

                if (!hasRole) {
                    message.client.storyChannels.filter((storyMembers, storyChannel) => {
                        if (storyChannel.name === roleName) {
                            if (storyMembers.length > 0) {
                                console.log('Full');
                                member.send('That story channel is currently full, max capacity is 1');
                            }
                            else {
                                storyMembers.push(member);
                                member.roles.add(role);
                            }
                        }
                    });
                }
                else {
                    member.send('You cannot join any new story channels since you are already joined to one. First leave your story channel before joining a new one.');
                }
            }
            else if (reaction.emoji.name === '❌') {
                msg.reactions.resolve('❌').users.remove(user);      
                
                message.client.storyChannels.filter((storyMembers, storyChannel) => {
                    if (storyChannel.name === roleName) {
                        if (storyMembers.length > 0) {
                            const index = storyMembers.indexOf(member);
                            if (index > -1) {
                                storyMembers.splice(index, 1);
                            }                              
                        }
                    }
                });

                member.roles.remove(role);
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    });
}