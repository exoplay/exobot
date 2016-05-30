const { Exobot, adapters, plugins } = require('../exobot');
const { Logger, Help, Greetings } = plugins;

const BOT_ALIAS = '!e';
const BOT_NAME = 'exobot';
const HTTP_LISTENER_PORT = process.env.PORT || '8080';
const LOG_LEVEL = process.env.EXOBOT_LOG_LEVEL || Logger.levels.DEBUG;

const bot = new Exobot(BOT_NAME, {
  alias: BOT_ALIAS,
  adapters: [
    new adapters.Shell(),
  ],
  plugins: [
    new Logger({ level: LOG_LEVEL }),
    new Help(),
    new Greetings(),
  ],
  port: HTTP_LISTENER_PORT,
});

module.exports = bot;
