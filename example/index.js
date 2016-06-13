const Log = require('log');

const { Exobot, adapters, plugins } = require('../exobot');
const { Help, Greetings, Points, DBDump, Giphy } = plugins;

const BOT_ALIAS = '!e';
const BOT_NAME = 'exobot';
const HTTP_LISTENER_PORT = process.env.PORT || '8080';
const LOG_LEVEL = process.env.EXOBOT_LOG_LEVEL || Log.INFO;
const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

const shell = adapters.Shell;

const bot = new Exobot(BOT_NAME, {
  alias: BOT_ALIAS,
  adapters: [
    new shell(),
  ],
  plugins: [
    new Help(),
    new Greetings(),
    new Points(),
    new DBDump(),
    new Giphy({ apiKey: GIPHY_API_KEY }),
  ],
  port: HTTP_LISTENER_PORT,
  logLevel: LOG_LEVEL,
  key: 'bananasaurus',
});

module.exports = bot;
