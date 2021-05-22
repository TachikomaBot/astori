const fs = require('fs');
const Discord = require('discord.js'); 
const Keyv = require('keyv');
const { token, maxEnergy } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.commandCDs = new Discord.Collection();
client.activeEnergyCD = new Discord.Collection();
client.energyUsers = new Discord.Collection();
client.badUsers = new Discord.Collection();
client.storyChannels = new Discord.Collection();

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

const commandFolders = fs.readdirSync('./commands');

const keyv = new Keyv();
keyv.on('error', err => console.error('Keyv connection error:', err));

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
		client.on(event.name, (...args) => event.execute(...args, client, keyv));
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
setInterval(intervalFunc, 1000 * 30 * 1 * 1);