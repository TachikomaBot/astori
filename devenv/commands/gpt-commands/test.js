module.exports = {
	name: 'test',
	description: 'A command for test purposes',
	cooldown: 3700,
	async execute(message, args) {			
		message.channel.send('This command has a long CD');
	},
};