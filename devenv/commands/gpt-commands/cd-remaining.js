const { completionCD } = require('../../config.json');

module.exports = {
	name: 'cd-remaining',
	description: 'Test',
	cooldown: 5,
	execute(message, args) {
		const { cooldowns } = message.client;

		const commandName = 'long-cd';

        const now = Date.now();
        const timestamps = cooldowns.get(commandName);
        const cooldownAmount = completionCD * 1000;

		if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
                let timeLeft = (expirationTime - now) / 1000;
                timeLeft = new Date(timeLeft * 1000).toISOString().substr(11, 8);

                message.delete()
                .then(msg => console.log(`Deleted message from ${msg.author.username}`))
                .catch(console.error);

                return message.author.send(`Please wait ${timeLeft} hh:mm:ss before reusing the \`${commandName}\` command.`);
            }
		}
		else {
			message.author.send('You can use the !continue command now.');
		}
	},
};