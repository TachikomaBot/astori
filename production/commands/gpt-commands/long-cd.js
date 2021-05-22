module.exports = {
	name: 'test',
	description: 'test command',
	cooldown: 60,
	execute(message, args) {
		message.channel.send('This command has a long CD');
	},
};