const Discord = require('discord.js'); 
const allRoleNames = new Discord.Collection();

const searchRoleName = 'searching';
const chillRoleName = 'chilling';

const paraRoleName = 'paragraph';
const multiparaRoleName = 'multi-para';
const novellaRoleName = 'novella';

const fantasyRoleName = 'fantasy';
const scifiRoleName = 'sci-fi';
const postapocRoleName = 'post-apocalyptic';
const fandomRoleName = 'fandom';
const superheroRoleName = 'superhero';
const sliceRoleName = 'slice of life';
const historicalRoleName = 'historical';
const modernRoleName = 'modern';

module.exports = {
	name: 'init-user-roles',
	description: 'Initialize channel with messages and reactions to allow users to self-select certain roles',
	cooldown: 5,
    permissions: 'ADMINISTRATOR',
	async execute(message) {	
        allRoleNames.set(searchRoleName, [129, 185, 219]);
        allRoleNames.set(chillRoleName, [45, 173, 92]);
        allRoleNames.set(paraRoleName, [250, 250, 250]);
        allRoleNames.set(multiparaRoleName, [250, 250, 250]);
        allRoleNames.set(novellaRoleName, [250, 250, 250]);

        createRoles(message)
        .then(() => {
            setupRoleCollectors(message);
        });
    },
};

async function createRoles(message) {
    allRoleNames.forEach((roleColor, roleName) => {
        createRole(message, roleName, '', roleColor);
    });
}

function setupRoleCollectors(message) {
    message.delete().then(msg => console.log(`Deleted message from ${msg.author.username}`));

    message.channel.send(`
    **Writing Activity** - This role lets other users know whether you're actively looking to join or start writing a story, or whether you're just chilling on the server. You can only select one role from this category.
    
**Seeking** - Click on the 🔭 if you're trying to start or join a story to write
**Chilling** - Click on the 🧊 if you're just chilling right now`)
    .then(msg => {        
            msg.react('🔭');
            msg.react('🧊');
            const filter = (reaction, user) => {
                return (reaction.emoji.name === '🔭' || reaction.emoji.name === '🧊') && !user.bot;
            };
            
            const collector = msg.createReactionCollector(filter);

            collector.on('collect', (reaction, user) => {
                
                const roleSearch = msg.guild.roles.cache.find(aRole => aRole.name === searchRoleName);
                const roleChill = msg.guild.roles.cache.find(aRole => aRole.name === chillRoleName);
                const guildMember = msg.guild.members.cache.find(aMember => aMember.id === user.id);

                console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);

                if (reaction.emoji.name === '🔭') {      
                    msg.reactions.resolve('🔭').users.remove(user);
                    guildMember.roles.remove(roleChill);
                    guildMember.roles.add(roleSearch);
                }

                if (reaction.emoji.name === '🧊') {      
                    msg.reactions.resolve('🧊').users.remove(user);
                    guildMember.roles.remove(roleSearch);
                    guildMember.roles.add(roleChill);
                }
            });
    });

    message.channel.send(`_ _
    **Writing-Style** - This role lets other users know how much you like to write in your stories. You can only select one role from this category.
    
**Paragraph** - Click on the 📝 if you usually write paragraph length posts
**Multi-Paragraph** - Click on the 🧾 if you usually write multi-paragraph length posts
**Paragraph** - Click on the 📖 if you usually write novella length posts`)
    .then(msg => {        
            msg.react('📝');
            msg.react('🧾');
            msg.react('📖');
            const filter = (reaction, user) => {
                return (reaction.emoji.name === '📝' || reaction.emoji.name === '🧾' || reaction.emoji.name === '📖') && !user.bot;
            };
            
            const collector = msg.createReactionCollector(filter);

            collector.on('collect', (reaction, user) => {
                
                const rolePara = msg.guild.roles.cache.find(aRole => aRole.name === paraRoleName);
                const roleMultipara = msg.guild.roles.cache.find(aRole => aRole.name === multiparaRoleName);
                const roleNovella = msg.guild.roles.cache.find(aRole => aRole.name === novellaRoleName);
                const guildMember = msg.guild.members.cache.find(aMember => aMember.id === user.id);

                console.log(`Collected ${reaction.emoji.name}  from ${user.tag}`);

                if (reaction.emoji.name === '📝') {      
                    msg.reactions.resolve('📝').users.remove(user);
                    guildMember.roles.remove(roleMultipara);
                    guildMember.roles.remove(roleNovella);
                    guildMember.roles.add(rolePara);
                }

                if (reaction.emoji.name === '🧾') {      
                    msg.reactions.resolve('🧾').users.remove(user);
                    guildMember.roles.remove(roleNovella);
                    guildMember.roles.remove(rolePara);
                    guildMember.roles.add(roleMultipara);
                }

                if (reaction.emoji.name === '📖') {      
                    msg.reactions.resolve('📖').users.remove(user);
                    guildMember.roles.remove(roleMultipara);
                    guildMember.roles.remove(rolePara);
                    guildMember.roles.add(roleNovella);
                }
            });
    });

    message.channel.send(`_ _
    **Genre Interests** - This role lets other users know which genres of fiction you enjoy writing. You can select multiple roles from this category.
    
**Fantasy** - Click on the 🧙‍♂️ if you enjoy telling Fantasy stories
**Sci-Fi** - Click on the 🚀 if you  enjoy telling Science Fiction stories
**Post-Apoc** - Click on the 🌇 if you  enjoy telling Post-Apocalyptic stories
**Fandom** - Click on the 🕵️‍♂️ if you  enjoy telling stories set in a Fandom or with characters from a Fandom
**Superhero** - Click on the 🦸‍♂️ if you enjoy telling stories is settings with superheros
**Slice of Life** - Click on the 🏄‍♂️ if you enjoy telling slice of life stories
**Historical** - Click on the 🏰 if you enjoy telling stories in historical settings
**Modern** - Click on the 🌃 if you enjoy telling stories in modern settings`)
    .then(msg => {        
            msg.react('🧙‍♂️');
            msg.react('🚀');
            msg.react('🌇');
            msg.react('🕵️‍♂️');
            msg.react('🦸‍♂️');
            msg.react('🏄‍♂️');
            msg.react('🏰');
            msg.react('🌃');
            const filter = (reaction, user) => {
                return (reaction.emoji.name === '🧙‍♂️' || reaction.emoji.name === '🧾' || reaction.emoji.name === '📖') && !user.bot;
            };
            
            const collector = msg.createReactionCollector(filter);

            collector.on('collect', (reaction, user) => {
                
                const roleFantasy = msg.guild.roles.cache.find(aRole => aRole.name === fantasyRoleName);
                const roleScifi = msg.guild.roles.cache.find(aRole => aRole.name === scifiRoleName);
                const rolePostapoc = msg.guild.roles.cache.find(aRole => aRole.name === postapocRoleName);
                const roleFandom = msg.guild.roles.cache.find(aRole => aRole.name === fandomRoleName);
                const roleSuperhero = msg.guild.roles.cache.find(aRole => aRole.name === superheroRoleName);
                const roleSlice = msg.guild.roles.cache.find(aRole => aRole.name === sliceRoleName);
                const roleHistorical = msg.guild.roles.cache.find(aRole => aRole.name === historicalRoleName);
                const roleModern = msg.guild.roles.cache.find(aRole => aRole.name === modernRoleName);
                const guildMember = msg.guild.members.cache.find(aMember => aMember.id === user.id);

                console.log(`Collected ${reaction.emoji.name}  from ${user.tag}`);

                if (reaction.emoji.name === '🧙‍♂️') {      
                    msg.reactions.resolve('🧙‍♂️').users.remove(user);
                    guildMember.roles.add(roleFantasy);
                }

                if (reaction.emoji.name === '🚀') {      
                    msg.reactions.resolve('🚀').users.remove(user);
                    guildMember.roles.add(roleScifi);
                }

                if (reaction.emoji.name === '🌇') {      
                    msg.reactions.resolve('🌇').users.remove(user);
                    guildMember.roles.add(rolePostapoc);
                }

                if (reaction.emoji.name === '🕵️‍♂️') {      
                    msg.reactions.resolve('🕵️‍♂️').users.remove(user);
                    guildMember.roles.add(roleFandom);
                }

                if (reaction.emoji.name === '🦸‍♂️') {      
                    msg.reactions.resolve('🦸‍♂️').users.remove(user);
                    guildMember.roles.add(roleSuperhero);
                }

                if (reaction.emoji.name === '🏄‍♂️') {      
                    msg.reactions.resolve('🏄‍♂️').users.remove(user);
                    guildMember.roles.add(roleSlice);
                }

                if (reaction.emoji.name === '🦸‍♂️') {      
                    msg.reactions.resolve('🦸‍♂️').users.remove(user);
                    guildMember.roles.add(roleHistorical);
                }

                if (reaction.emoji.name === '🏄‍♂️') {      
                    msg.reactions.resolve('🏄‍♂️').users.remove(user);
                    guildMember.roles.add(roleModern);
                }
            });
    });
}

function createRole(message, roleName, reasonStr = '', roleColor = [255, 255, 255]) {
    let roleExists = false;
    message.guild.roles.cache.forEach(role => {
        if (role.name === roleName) {
            roleExists = true;
        }
    });

    if (!roleExists) {
        message.guild.roles.create({
            data: {
                name: roleName,
                color: roleColor,
            },
            reason: reasonStr,
        });
    }
}