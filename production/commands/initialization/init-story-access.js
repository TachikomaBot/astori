module.exports = {
	name: 'init-portal',
	description: 'Initialize the a channel for users to add or remove role to access story channels.',
    permissions: 'ADMINISTRATOR',
	cooldown: 5,
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

async function setupRole(message, roleName) {
    let msgToEdit = '';

    message.channel.send(`_ _\nClick on the checkmark to join and contribute to the **${roleName}** channel, or the X to leave it.`)
    .then(msg => {        
        msg.react('☑️');
        msg.react('❌');
        const filter = (reaction, user) => {
            return (reaction.emoji.name === '☑️' || reaction.emoji.name === '❌') && !user.bot;
        };
        
        const collector = msg.createReactionCollector(filter);

        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name}  from ${user.tag}`);

            const role = msg.guild.roles.cache.find(aRole => aRole.name === roleName);
            const member = msg.guild.members.cache.find(aMember => aMember.id === user.id);

            const storyChannels = message.client.storyChannels;

            let hasRole = false;

            member.roles.cache.filter(memberRole => {
                storyChannels.forEach((storyMembers, storyChannel) => {
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
                            storyMembers.every((members, maxNumMembers) => {
                                // console.log(`${members}, ${maxNumMembers}`);
                                if (members.length >= maxNumMembers) {
                                    console.log(`Full, ${storyMembers.length}`);
                                    member.send(`That story channel is currently full, max capacity for that channel is ${maxNumMembers}`);
                                }
                                else {
                                    members.push(member);
                                    member.roles.add(role);

                                    updateMemberList(message, msgToEdit, roleName);
                                }
                            });
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
                        storyMembers.every((members, maxNumMembers) => {
                            if (members.length > 0) {
                                const index = members.indexOf(member);
                                if (index > -1) {
                                    members.splice(index, 1);
                                    updateMemberList(message, msgToEdit, roleName);
                                }                              
                            }
                        });
                    }
                });

                // ok to leave remove out here since if they don't have the role to remove, nothing will happen, if they do have the role then its ok to remove it
                member.roles.remove(role);
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    });
    message.channel.send(`${roleName} is currently empty.\n`).then(msg => {
        msgToEdit = msg;
        console.log(`sent msg ${msgToEdit}`);
    });
}

function updateMemberList(message, msgToEdit, roleName) {        
    message.client.storyChannels.filter((storyMembers, storyChannel) => {
        if (storyChannel.name === roleName) {
            storyMembers.every((members, maxNumMembers) => {
                msgToEdit.edit(`Channel limit: ${maxNumMembers}\nCurrent members joined to the ${roleName} story channel:\n${members}`);
            });
        }
    });
}