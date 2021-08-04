"use strict";

const dotenv = require('dotenv');
const {Client, Intents} = require('discord.js');

dotenv.config();

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', message => {
  console.log(message.content);
});

client.login(process.env.BOT_TOKEN);

/*

  to add bot visit:

https://discord.com/oauth2/authorize?client_id=872610812794130472&scope=bot&permissions=51539610624

*/
