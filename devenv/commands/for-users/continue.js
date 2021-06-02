const fetch = require('node-fetch');

const { authentication, completionCD, completionEnergy, maxEnergy } = require('../../config.json');

module.exports = {
	name: 'continue',
	description: 'Request GPT-3 to continue the story, using the past posts in the channel as the prompt.',
	cooldown: completionCD,
	checkEnergy: true,
	async execute(message, args) {
		let isStoryChannel = false;
		
        const { importantChannels, energyUsers } = message.client;
		const botReplyCID = importantChannels.get('botReplyCID');

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
					const wrongChannelMsg = 'This is not a valid channel for that command.';
					message.author.send(wrongChannelMsg).catch(() => {
						message.client.channels.cache.get(botReplyCID).send(`${message.author} ${wrongChannelMsg}\nAllow DMs from server members to get private bot responses.`);
					});
					return;
				}

				const currEnergy = energyUsers.get(message.author);

				if (currEnergy < completionEnergy) {
					const noEnergyMsg = `You do not have enough energy to use the !continue command. You have ${currEnergy} / ${maxEnergy} energy, it takes ${completionEnergy} to use the !continue command. See #energy-system channel for more info on how energy works.`;
					message.author.send(noEnergyMsg).catch(() => {
						message.client.channels.cache.get(botReplyCID).send(`${message.author} ${noEnergyMsg}\nAllow DMs from server members to get private bot responses.`);
					});
					return;
				}

				message.channel.updateOverwrite(message.channel.guild.roles.everyone, { SEND_MESSAGES: false });

				message.channel.messages.fetch({ limit: 15 }).then(async messages => {
					const pastMessages = [];

					if (messages.first().author.bot) {
						console.log(`last message author: ${messages.first().author.bot}`);
						const lastMsgBotMsg = 'The last message in this story channel was written by a bot. You cannot use !continue unless the last message in the story was written by a human.';
						message.author.send(lastMsgBotMsg).catch(() => {
							message.client.channels.cache.get(botReplyCID).send(`${message.author} ${lastMsgBotMsg}\nAllow DMs from server members to get private bot responses.`);
						});
						return;
					}

					if (messages.size > 0) {
						messages.forEach(pastMessage => {
							pastMessages.push(pastMessage);
						});

						const currPromptArr = [];
						pastMessages.reverse().forEach(item => {
							let combinedStr = currPromptArr.join('');
							if (combinedStr.length + item.content.length < 4000) {
								const strContent = item.content.replace(/_ _/g, '');
								currPromptArr.push(strContent + '\n');		
								// console.log(`current len: ${combinedStr.length + item.content.length}`);						
							}
							else {
								while (combinedStr.length + item.content.length > 4000) {
									currPromptArr.reverse().pop();
									combinedStr = currPromptArr.reverse().join('');
									// console.log(`after removal, current len: ${combinedStr.length + item.content.length}`);
								}
								const strContent = item.content.replace(/_ _/g, '');
								currPromptArr.push(strContent + '\n');	
							}
						});
						const currPromptStr = currPromptArr.join('');

						console.log(`Current prompt: ${currPromptStr}`);

						const finalText = await getCompletion(currPromptStr);

						if (finalText) {
							message.channel.send(finalText);
						}
						
						message.channel.updateOverwrite(message.channel.guild.roles.everyone, { SEND_MESSAGES: true });
					}
				}).catch(console.error);
			}).catch(console.error);
	},
};

async function getCompletion(currentPrompt) {
	const bodyCompletion = {
		prompt: currentPrompt,
		max_tokens: 150,
		temperature: 0.64,
		top_p: 0.75,
		n: 1,
		stream: false,
		logprobs: null,
		presence_penalty: 0.5,
		frequency_penalty: 0.5,
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