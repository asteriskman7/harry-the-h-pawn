"use strict";

/*
  TODO: 
  add method to clean up games that are dead or unwanted
*/

const dotenv = require('dotenv');
const redis = require('redis');
const {Client, Intents, MessageAttachment, ThreadManager } = require('discord.js');
const { createCanvas } = require('canvas');

const { NumberGuess } = require('./NumberGuess');

//get config from .env file
dotenv.config();

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

//connect to redis db
const db = redis.createClient({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
});

//when db is ready, connect to discord
db.on('ready', () => {
  console.log('DB ready');
  client.login(process.env.BOT_TOKEN);
});

client.once('ready', () => {
  console.log('Discord login complete.');
});

//map of thread ids to game objects
const threadMap = new Map();
//map of thread ids to user id lists
const gameUsers = new Map();
//map of thread ids to users turn indexes
const gameTurn = new Map();

//setup map for available games
const gameMap = new Map();

gameMap.set('numberGuess', NumberGuess);

//setup handlers for commands in command channel
const cmdHandlers = new Map();

cmdHandlers.set('new', {
  cmd: (message, args) => {
    const gameClass = gameMap.get(args[0]);
    if (gameClass === undefined) {
      message.channel.send('Unrecognized game name');
    } else {
      //get users list
      console.log(message.content);
      const users = [...message.content.matchAll(/<@!?(\d+)>/g)].map( v => v[1] );
      console.log(users);
      return;
      //create new discord thread 
      const threadName = args.join` `;
      message.channel.threads.create({
        name: threadName,
        autoArchiveDuration: 60, //minutes
        reason: message.content
      }).then( threadChannel => {
        //start new game
        const game = new gameClass(threadChannel.id, db, args.slice(1));
        gameUsers.set(threadChannel.id, users);
        gameTurn.set(threadChannel.id, 0);
        threadMap.set(threadChannel.id, game);
        threadChannel.send('welcome to game thread');
      });
    }
  },
  help: `new <gameName> <player list> [game options]: `
});

cmdHandlers.set('listGames', {
  cmd: (message, args) => {
    let gameList = [];
    gameMap.forEach( (value, key) => {
      gameList.push(key);
    });

    gameList.sort();

    const msg = `\`\`\`Playable games:\n${gameList.join`\n`}\`\`\``;
    message.channel.send(msg);
  },
  help: 'listGames: Print a list of playable games.'
});

cmdHandlers.set('gameHelp', {
  cmd: (message, args) => {
    const gameClass = gameMap.get(args[0]);
    if (gameClass === undefined) {
      message.channel.send('Unrecognized game name');
    } else {
      message.channel.send(`\`\`\`${gameClass.getHelp()}\`\`\``);
    }
  },
  help: 'gameHelp <gameName>: Print game specific help including options.'
});

cmdHandlers.set('help', (() => {
  const helpCmd = {
    help: 'help [commandName]: display command help'
  };

  const keyList = [];
  cmdHandlers.forEach( (value, key) => keyList.push(key) );
  keyList.sort();

  let helpText = `\`\`\`harry-the-h-pawn manages turn based games like tic-tac-toe and chess.
Games are spawned into new threads. Inside threads, no prefix is necessary to indicate game moves.
Commands:`;

  keyList.forEach( k => {
    helpText += `\n\n${cmdHandlers.get(k).help}`; 
  });

  helpText += '```';

  helpCmd.cmd = (message, args) => message.channel.send(helpText);

  return helpCmd;
  })()
);

//handle discord messages
client.on('messageCreate', message => {
  //does it now include messages from itself?


  //if author is a bot, reject
  if (message.author.bot) {return;}
    
  //if in the cmd channel
  if (message.channel.name === process.env.CMD_CHANNEL) {
    console.log('process cmd');
    const cmdList = message.content.split` `;
    if (cmdList[0] !== 'harry') {return;}
    
    const cmd = cmdList[1];
    const args = cmdList.slice(2);

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





/*

  to add bot visit:

https://discord.com/oauth2/authorize?client_id=872610812794130472&scope=bot&permissions=51539610624

*/
