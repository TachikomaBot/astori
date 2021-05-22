const Discord = require('discord.js'); 
const fs = require('fs');
const fetch = require('node-fetch');

const { authentication } = require('./config.json');

function timeoutUser(client, command, message, cooldownAmount) {
	let isAlreadyOnCD = false;

	const { commandCDs } = client;

        if (!commandCDs.has(command.name)) {
            commandCDs.set(command.name, new Discord.Collection());
        }

		console.log(`command timedout: ${command.name}`);

        const now = Date.now();
        const timestamps = commandCDs.get(command.name);

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                let timeLeft = (expirationTime - now) / 1000;
                timeLeft = new Date(timeLeft * 1000).toISOString().substr(11, 8);

                message.delete()
                .then(msg => console.log(`Deleted message from ${msg.author.username}`))
                .catch(console.error);

                message.author.send(`Please wait ${timeLeft} hh:mm:ss before reusing the \`${command.name}\` command.`);

				isAlreadyOnCD = true;
            }
        }
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
		return isAlreadyOnCD;
}

async function checkMessageStorySafety(message, keyv) {
    // console.log(`past message: ${aPastMessage}`);

	const prompts = fs.readdirSync('./prompts');
	let storyFilterPrompt;
	let safetyFilterPrompt;
	
	const dumpChannelID = await keyv.get('dumpChannelID');

	for (const file of prompts) {
		if (file === 'story_filter.txt') {
			storyFilterPrompt = fs.readFileSync(`./prompts/${file}`, 'utf-8');
		}
		
		if (file === 'safety_filter.txt') {
			safetyFilterPrompt = fs.readFileSync(`./prompts/${file}`, 'utf-8');
		}
	}
    const isSafe = await checkOAISafety(message);

	// 0 = fully safe, 1 = questionable, 2 = unsafe
    if (isSafe == 0) {
		const storyLike = await checkStoryLike(storyFilterPrompt, message);

		// 1 = not story-like, 5 = very story-like
		if (storyLike < 3) {
			// lock channel, dm user message not story-like enough
			message.author.send('Your recent post has been flagged as not being appropriate for a story due to its structure and has been removed and logged for safety purposes. Please contact a moderator if you believe your post was misclassified.');

			message.client.channels.cache.get(dumpChannelID).send(`Flagged as insufficiently story-like post.\n**Author:** ${message.author.username}\n**Content:** ${message.content}`);

			message.delete().then(msg => console.log(`Deleted message from ${msg.author.username}`));
		}
    }
	else {
		// run custom safety check
		let customSafetyResponse;
		if (isSafe == 2) {
			customSafetyResponse = await checkCustomSafety(safetyFilterPrompt, message);

			// if (customSafetyResponse.includes('Hateful') || customSafetyResponse.includes('Sexual Violence') || customSafetyResponse.includes('Political') || customSafetyResponse.includes('Religious')) {
			message.author.send(`Your recent post has been flagged for containing [${customSafetyResponse}] content and has been removed and logged for safety purposes. Please contact a moderator if you believe your post was misclassified.`);

			message.client.channels.cache.get(dumpChannelID).send(`Flagged as unsafe post containing [${customSafetyResponse}] content.\n**Author:** ${message.author.username}\n**Content:** ${message.content}_ _`);

			message.delete().then(msg => console.log(`Deleted message from ${msg.author.username}`));
			// }
		}		
		else {
			message.author.send('Your recent post has been flagged as being potentially unsafe and will be manually reviewed by a human moderator. It has been logged for safety purposes. Please contact a moderator if you believe your post was misclassified.');

			message.client.channels.cache.get(dumpChannelID).send(`Flagged as potentially unsafe post.\n**Author:** ${message.author.username}\n**Content:** ${message.content}`);

			const storyLike = await checkStoryLike(storyFilterPrompt, message);

			// 1 = not story-like, 5 = very story-like
			if (storyLike < 3) {
				// lock channel, dm user message not story-like enough
				message.author.send('Your recent post has been flagged as not being appropriate for a story due to its structure and has been removed and logged for safety purposes. Please contact a moderator if you believe your post was misclassified.');

				message.client.channels.cache.get(dumpChannelID).send(`Flagged as insufficiently story-like post.\n**Author:** ${message.author.username}\n**Content:** ${message.content}`);

				message.delete().then(msg => console.log(`Deleted message from ${msg.author.username}`));
			}
		}
	}
} 

module.exports = { checkMessageStorySafety, timeoutUser };

async function checkOAISafety(aPastMessage) {
	const msgContent = aPastMessage.content;

	const body = {
		prompt: `<|endoftext|>${msgContent}\n--\nLabel:`,
		temperature: 0,
		max_tokens: 1,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
		logprobs: 10,
	};

	const { choices } = await fetch('https://api.openai.com/v1/engines/content-filter-alpha-c4/completions', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${authentication}`,
		},
	})
	.then(response => response.json());

	const { text } = choices[0];

	const toxic_threshold = -0.355;
	let output_label = text;

	if (text === '2') {
		const { logprobs } = choices[0];
		const { top_logprobs } = logprobs;
		const { 2 : logprob_2 } = top_logprobs[0];

		console.log(choices[0]);
		console.log(logprobs);
		console.log(top_logprobs);

		if (logprob_2 < toxic_threshold) {
			const { 0 : logprob_0 } = top_logprobs[0];
			const { 1 : logprob_1 } = top_logprobs[0];

			if (logprob_0 && logprob_1) {
				if (logprob_0 >= logprob_1) {
					output_label = '0';
				}
				else {
					output_label = '1';
				}
			}
			else if (logprob_0) {
				output_label = '0';				
			}
			else if (logprob_1) {
				output_label = '1';	
			}
		}
	}

	console.log(`OAI CF label: ${output_label}`);

	return output_label;
}

async function checkStoryLike(prompt, message) {
	const msgContent = message.content;

	console.log(`msg content: ${msgContent}`);

	const body = {
		prompt: `${prompt}\nInput:${msgContent}\nLabel:`,
		max_tokens: 2,
		temperature: 0,
		top_p: 0,
		n: 1,
		stream: false,
		logprobs: null,
		stop: ['###'],
	};

	const { choices } = await fetch('https://api.openai.com/v1/engines/davinci-instruct-beta/completions', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${authentication}`,
		},
	})
	.then(response => response.json());

	const { text } = choices[0];
	const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
	const cleanText = text.replace(regex, '').trim();

	console.log(`storylike: ${cleanText}`);

	return cleanText;
}

async function checkCustomSafety(prompt, message) {
	const msgContent = message.content;

	const body = {
		prompt: `${prompt}\nInput:${msgContent}\nLabels:`,
		max_tokens: 24,
		temperature: 0,
		top_p: 0,
		n: 1,
		stream: false,
		logprobs: null,
		stop: ['###'],
	};

	const { choices } = await fetch('https://api.openai.com/v1/engines/davinci-instruct-beta/completions', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${authentication}`,
		},
	})
	.then(response => response.json());

	const { text } = choices[0];
	// const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
	const cleanText = text.trim().split(',');

	console.log(`custom safety: ${cleanText}`);

	return cleanText;
}