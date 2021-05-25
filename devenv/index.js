const fs = require('fs');
const Discord = require('discord.js'); 
const { token, maxEnergy } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.commandCDs = new Discord.Collection();
client.activeEnergyCD = new Discord.Collection();
client.energyUsers = new Discord.Collection();
client.badUsers = new Discord.Collection();
client.storyChannels = new Discord.Collection();
client.importantChannels = new Discord.Collection();

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} 
	else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

client.login(token);

function intervalFunc() {
	client.energyUsers.forEach(function(energy, user) {
		if (energy < maxEnergy) {
			energy += 1;
			client.energyUsers.set(user, energy);
			console.log(`Passive Energy gained, user: ${user.tag}, new energy: ${energy}`);
		}
	});
}
  
// milli * sec * min * hr
setInterval(intervalFunc, 1000 * 60 * 3 * 1);