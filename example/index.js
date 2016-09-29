require('babel-polyfill');

const { Exobot, adapters, plugins } = require('../exobot');
const { Help, Greetings, Permissions } = plugins;

const shell = adapters.Shell;

const bot = new Exobot({
  adapters: [
    new shell(),
  ],
  plugins: [
    new Help(),
    new Greetings(),
    new Permissions(),
  ],
});

module.exports = bot;
