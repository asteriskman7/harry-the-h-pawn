"use strict";

const dotenv = require('dotenv');
const redis = require('redis');
const {Client, Intents, MessageAttachment, ThreadManager } = require('discord.js');
const { createCanvas } = require('canvas');

dotenv.config();

const db = redis.createClient({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
});

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
  console.log('Ready!');
});

const cmdHandlers = new Map();

cmdHandlers.set('new', {
  cmd: (message, args) => {message.channel.send('create new game');},
  help: `start a new game`
});

cmdHandlers.set('help', (() => {
  const helpCmd = {
    help: 'display command help'
  };

  const keyList = [];
  cmdHandlers.forEach( (value, key) => keyList.push(key) );
  keyList.sort();

  let helpText = `\`\`\`harry-the-h-pawn manages turn based games like tic-tac-toe and chess.
Games are spawned into new threads. Inside threads, no prefix is necessary to indicate game moves.
Commands:
`;

  keyList.forEach( k => {
    helpText += `\n${k}: ${cmdHandlers.get(k).help}`; 
  });

  helpText += '```';

  helpCmd.cmd = (message, args) => message.channel.send(helpText);

  return helpCmd;
  })()
);

client.on('messageCreate', message => {
  //does it now include messages from itself?


  //if author is a bot, reject
  if (message.author.bot) {return;}
    
  //if in the main channel
  if (message.channel.name === process.env.CMD_CHANNEL) {
    console.log('process cmd');
    const cmdList = message.content.split` `;
    if (cmdList[0] !== 'harry') {return;}
    
    const cmd = cmdList[1];
    const args = cmdList.slice(2).join` `;

    if (cmdHandlers.has(cmd)) {
      cmdHandlers.get(cmd).cmd(message, args);
    } else {
      message.channel.send('Unrecognized command.');
    }

  } else {
    console.log('check channel');
  }

  /*
  //if in a game channel dispatch msg to game

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
  */
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
