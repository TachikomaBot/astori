module.exports = {
	name: 'purge',
	description: 'Purge messages in chat, with no argument, deletes 50 messages. Max 100.',
	cooldown: 1,
    permissions: 'ADMINISTRATOR',
	execute(message, args) {
        let amount = parseInt(args[0]) + 1;

        if (isNaN(amount)) {
            // return message.reply('that doesn\'t seem to be a valid number.');
            amount = 99;
        } 
        else if (amount <= 1 || amount > 100) {
            return message.reply('you need to input a number between 1 and 99.');
        }
        message.channel.bulkDelete(amount, true).catch(err => {
            console.error(err);
            message.channel.send('there was an error trying to prune messages in this channel!');
        });
	},
};