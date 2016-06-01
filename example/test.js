const Log = require('log');

const { Exobot, adapters, plugins } = require('../exobot');
const { Help, Greetings } = plugins;

const BOT_ALIAS = '!e';
const BOT_NAME = 'exobot';
const HTTP_LISTENER_PORT = process.env.PORT || '8080';
const LOG_LEVEL = process.env.EXOBOT_LOG_LEVEL || Log.INFO;

const shell = adapters.Shell;

const bot = new Exobot(BOT_NAME, {
  alias: BOT_ALIAS,
  adapters: [
    new shell(),
  ],
  plugins: [
    new Help(),
    new Greetings(),
  ],
  port: HTTP_LISTENER_PORT,
  logLevel: LOG_LEVEL,
});

module.exports = bot;
