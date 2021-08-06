"use strict";

const dotenv = require('dotenv');
const {Client, Intents, MessageAttachment, ThreadManager } = require('discord.js');
const { createCanvas } = require('canvas');

dotenv.config();

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
  console.log('Ready!');
});

client.on('messageCreate', message => {
  //does it now include messages from itself?

  console.log(message.content);

  console.log('message is ' + (message.channel.isThread() ? '' : 'not ') + 'from a thread');
  console.log('channel name is', message.channel.name);
  console.log('channel id is', message.channel.id);

  const gID = '226365635280633856';
  const tID = '873337922496131152';

  //const gchannel = message.guild.channels.fetch(gID.toString()).then( c => c.send('general msg'));
  //const tchannel = message.guild.channels.fetch(tID.toString()).then( c => c.send('thread msg'));

  if (message.content === 'send') {
    message.guild.channels.cache.get(gID).send('general msg');
  }
  if (message.content === 'send2') {
    message.guild.channels.cache.get(tID).send('thread msg');
  }
  if (message.content === 'archive') {
    if (message.channel.isThread()) {
      message.channel.setArchived(true);
    }
  }
  if (message.content === 'delete') {
    if (message.channel.isThread()) {
      message.channel.delete('done');
    }
  }
  /*
  if (message.content === 'make') {
    //message.channel.send('TMP');
    message.channel.threads.create({
      name: 'thread-test',
      autoArchiveDuration: 60, //minutes
      reason: 'This is a thread test reason'
    });
  }
  */
});

client.login(process.env.BOT_TOKEN);

/*

  to add bot visit:

https://discord.com/oauth2/authorize?client_id=872610812794130472&scope=bot&permissions=51539610624

*/
