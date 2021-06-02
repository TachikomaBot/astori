module.exports = {
	name: 'test',
	description: 'A command for test purposes',
	cooldown: 30,
    permissions: 'ADMINISTRATOR',
	async execute(message, args) {			
		message.channel.send('This command has a long CD');
	},
};