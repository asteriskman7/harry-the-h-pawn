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
const { TicTacToe } = require('./TicTacToe');

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

  //create a game object for saved games
  db.hgetall('gameInfo', (err, reply) => {
    //reply is an object
    if (err === null && reply !== null) {
      console.log('Loading games in progress.');
      Object.keys(reply).forEach( threadID => {
        const info = JSON.parse(reply[threadID]);
        const gameName = info.name;
        const gameClass = gameMap.get(gameName);
        if (gameClass === undefined) {return;}

        const game = new gameClass(threadID, db, [], '');
        threadMap.set(threadID, game);
      });
    }

    client.login(process.env.BOT_TOKEN);
  });
});

client.once('ready', () => {
  console.log('Discord login complete.');
});

//map of thread ids to game objects
const threadMap = new Map();
//map of thread ids to users turn indexes
const gameTurn = new Map();

//setup map for available games
const gameMap = new Map();

gameMap.set('numberGuess', NumberGuess);
gameMap.set('tictactoe', TicTacToe);

//setup handlers for commands in command channel
const cmdHandlers = new Map();

cmdHandlers.set('new', {
  cmd: async (message, args) => {
    const gameName = args.split` `[0];
    const gameClass = gameMap.get(gameName);
    if (gameClass === undefined) {
      message.channel.send('Unrecognized game name');
    } else {
      //get users list
      const users = [...message.content.matchAll(/<@!?(\d+)>/g)].map( v => v[1] );
      //create new discord thread 
      const threadName = message.cleanContent.split` `.slice(2).join` `;

      const threadChannel = await message.channel.threads.create({
        name: threadName,
        autoArchiveDuration: 60, //minutes
        reason: message.content
      })

      //start new game
      //save game name and user list so games can be recreated
      db.hset("gameInfo", threadChannel.id, JSON.stringify({name: gameName, users}));
      const gameArgs = args.match(/ (.*)/)[1];
      const game = new gameClass(threadChannel.id, db, users, gameArgs);
      gameTurn.set(threadChannel.id, 0);
      threadMap.set(threadChannel.id, game);
      const mentionString = users.map( v => `<@${v}>` ).join` `;
      const firstMsg = 'New game: ' + message.content.split` `.slice(2).join` ` +
      `\nYour turn <@${users[0]}>!`;
      threadChannel.send(firstMsg);
    }
  },
  help: `new <gameName> <playerList> ([gameOptions]): Start new game of gameName. 
playerList is space separated mentions of players.
gameOptions is comma separated key=value pairs surrounded by parenthesis.`
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
    const gameClass = gameMap.get(args);
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
client.on('messageCreate', async message => {
  //does it now include messages from itself?


  //if author is a bot, reject
  if (message.author.bot) {return;}
    
  //if in the cmd channel
  const cmdList = message.content.split` `;
  if (message.channel.name === process.env.CMD_CHANNEL) {
    console.log('process cmd');
    if (cmdList[0] !== process.env.PREFIX_CMD) {return;}
    
    const cmd = cmdList[1];
    const args = cmdList.slice(2);

    if (cmdHandlers.has(cmd)) {
      cmdHandlers.get(cmd).cmd(message, args.join` `);
    } else {
      message.channel.send('Unrecognized command.');
    }

  } else {
    if (cmdList[0] !== process.env.PREFIX_THREAD) {return;}
    const threadGame = threadMap.get(message.channel.id);
    if (threadGame === undefined) {return;}
    
    const turnResponse = threadGame.takeTurn(message.author.id, cmdList.slice(1).join` `);

    //print responses
    while (turnResponse.responses.length > 0) {
      switch (turnResponse.responses[0].type) {
        case 'text': {
          await message.channel.send(turnResponse.responses[0].content);
          break;
        }
        case 'image': {
          const attachment = new MessageAttachment(buffer);
          await message.channel.send(attachment);
          break;
        }
      }
      turnResponse.responses.shift();
    }

    if (!turnResponse.over) {
    }
  }

});


/*

  to add bot visit:

https://discord.com/oauth2/authorize?client_id=872610812794130472&scope=bot&permissions=51539610624

*/
