#!/usr/bin/env node
require('babel-polyfill');

const Log = require('log');

const { Exobot, adapters, plugins } = require('../exobot');
const { Help, Greetings, Permissions } = plugins;

const config = require(`${process.cwd()}/package.json`);

function guessName(name, keys) {
  let match = keys.find(k => k === name);
  if (match) { return match; }

  match = keys.find(k => k.toLowerCase() === name.toLowerCase());
  return match;
}


const name = config.main.split('.js')[0];
const className = process.argv[2] || name;

const requiredPlugin = require(`${process.cwd()}/${config.main}`);
const Plugin = requiredPlugin[guessName(className, Object.keys(requiredPlugin))];

if (!Plugin) {
  console.log('Couldn\'t find class name; try passing it in as an argument.');
  process.exit(1);
}

const {
  BOT_ALIAS = '!e',
  BOT_NAME = 'exobot',
  HTTP_LISTENER_PORT = '8080',
  LOG_LEVEL = Log.INFO,
  ADMIN_PASSWORD = 'admin',
  ENCRYPTION_KEY = 'encryptionkey',
} = process.env;

const shell = adapters.Shell;

const bot = new Exobot(BOT_NAME, {
  alias: BOT_ALIAS,
  adapters: [
    new shell(),
  ],
  plugins: [
    new Help(),
    new Greetings(),
    new Permissions({
      adminPassword: ADMIN_PASSWORD,
    }),
    new Plugin(),
  ],
  port: HTTP_LISTENER_PORT,
  logLevel: LOG_LEVEL,
  key: ENCRYPTION_KEY,
  requirePermisisons: true,
});

module.exports = bot;
