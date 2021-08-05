"use strict";

const dotenv = require('dotenv');
const {Client, Intents, MessageAttachment } = require('discord.js');
const { createCanvas } = require('canvas');

dotenv.config();

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', message => {
  console.log(message.content);

  if (message.content === 'draw') {
    const squareWidth = 20;
    const borderSize = 20;
    const width = 2 * borderSize + 8 * squareWidth;
    const height = width;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'hsl(53, 46%, 83%)';
    ctx.fillRect(0, 0, width, height);

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const colorIndex = (x % 2 + y) % 2;
        ctx.fillStyle = ['white', 'black'][colorIndex];
        ctx.fillRect(borderSize + x * squareWidth, borderSize + y * squareWidth, squareWidth, squareWidth);
      }
    }

    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    //ctx.fillText('Cool Words!', 100, 100);
    for (let i = 0; i < 8; i++) {
      ctx.fillText('ABCDEFGH'[i], borderSize + squareWidth * i, 20);
      ctx.fillText('ABCDEFGH'[i], borderSize + squareWidth * i, height);
      ctx.fillText(i + 1, 0, borderSize + squareWidth * i + 20);
      ctx.fillText(i + 1, width - 20, borderSize + squareWidth * i + 20);
    }

    const buffer = canvas.toBuffer('image/png', {compressionLevel: 9});

    const attachment = new MessageAttachment(buffer);
    message.channel.send(attachment);
  }
});

client.login(process.env.BOT_TOKEN);

/*

  to add bot visit:

https://discord.com/oauth2/authorize?client_id=872610812794130472&scope=bot&permissions=51539610624

*/
