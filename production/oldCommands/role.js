module.exports = {
	name: 'role',
	description: 'Gives a user a role',
	args: true,
    usage: '<user> <role>',
	execute(message, args) {
		if (args[0] === 'foo') {
			return message.channel.send('bar');
		}

		message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
	},
};