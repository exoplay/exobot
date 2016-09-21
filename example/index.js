require('babel-polyfill');

const Log = require('log');

const { Exobot, adapters, plugins } = require('../exobot');
const { Help, Greetings, Permissions } = plugins;

const {
  BOT_ALIAS = '!e',
  BOT_NAME = 'exobot',
  HTTP_LISTENER_PORT = '8080',
  LOG_LEVEL = Log.INFO,
  ENCRYPTION_KEY = 'bananasaurus',
  ADMIN_PASSWORD = 'wuttup',
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
  ],
  port: HTTP_LISTENER_PORT,
  logLevel: LOG_LEVEL,
  key: ENCRYPTION_KEY,
  requirePermisisons: true,
});

module.exports = bot;
