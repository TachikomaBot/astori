const fetch = require('node-fetch');

const { authentication, completionCD, completionEnergy, maxEnergy } = require('../../config.json');

module.exports = {
	name: 'continue',
	description: 'Add new content to the story',
	cooldown: 15,
	checkEnergy: true,
	async execute(message, args, keyv) {

		let isStoryChannel = false;

        message.client.storyChannels.filter(function(storyMembers, storyChannel) {
            console.log(`${storyChannel.id}, ${message.channel.id}`);
			if (storyChannel.id === message.channel.id) {
                isStoryChannel = true;
            }
		});

		message.delete()
			.then(msg => console.log(`Deleted message from ${msg.author.username}`))
			.then(() => {
				if (!isStoryChannel) {
					message.author.send('This is not a valid channel for that command.');
					return;
				}

				const { energyUsers } = message.client;
				const currEnergy = energyUsers.get(message.author);

				if (currEnergy < completionEnergy) {
					message.author.send(`You do not have enough energy to use the !continue command. You have ${currEnergy} / ${maxEnergy} energy, it takes ${completionEnergy} to use the !continue command. See #energy-system channel for more info on how energy works. (OFF FOR TESTING)`);
					// return;
				}

				message.channel.updateOverwrite(message.channel.guild.roles.everyone, { SEND_MESSAGES: false });

				message.channel.messages.fetch({ limit: 15 }).then(async messages => {
					const pastMessages = [];

					if (messages.size > 0) {
						messages.forEach(pastMessage => {
							pastMessages.push(pastMessage);
						});

						let currentPrompt = '';
						pastMessages.reverse().forEach(item => {
							if (currentPrompt.length + item.content.length < 4000) {
								const strContent = item.content.replace(/_ _/g, '');
								/* if (args.length > 0 && args[0].toLowerCase() === 'rp') {
									currentPrompt += item.author.username + ': ' + strContent + '\n';
								}*/
								currentPrompt += strContent + '\n';								
							}
						});

						console.log(`Current prompt: ${currentPrompt}`);

						const finalText = await getCompletion(currentPrompt);

						if (finalText) {
							message.channel.send(finalText);
						}				
						
						message.channel.updateOverwrite(message.channel.guild.roles.everyone, { SEND_MESSAGES: true });
					}
				}).catch(console.error);
			}).catch(console.error);

			// console.log('continue');
	},
};

async function getCompletion(currentPrompt) {
	const bodyCompletion = {
		prompt: currentPrompt,
		max_tokens: 150,
		temperature: 0.75,
		top_p: 0.75,
		n: 1,
		stream: false,
		logprobs: null,
		presence_penalty: 0.5,
		frequency_penalty: 0.5,
		stop: ['/n'],
	};

	const { 'choices': choicesCompletion } = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
		method: 'POST',
		body: JSON.stringify(bodyCompletion),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${authentication}`,
		},
	}).then(response => response.json());

	console.log(choicesCompletion);

	const { 'text': textCompletion } = choicesCompletion[0];

	const regex = /[!?.]/g;

	const lastPeriod = textCompletion.lastIndexOf(textCompletion.match(regex).pop());
	const finalText = textCompletion.slice(0, lastPeriod + 1);

	return finalText;
}