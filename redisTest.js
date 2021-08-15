"use strict";

const dotenv = require('dotenv');
const redis = require('redis');

dotenv.config();

const client = redis.createClient({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
});

client.set('foo', 'bar', (err, reply) => {
  if (err) throw err;
  console.log(reply);

  client.get('foo', (err, reply) => {
    if (err) throw err;
    console.log('foo=', reply);
  });
});
