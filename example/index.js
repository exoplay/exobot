require('babel-polyfill');

const { Exobot, adapters, plugins } = require('../exobot');
const { Help, Greetings, Permissions, Config } = plugins;

const shell = adapters.Shell;

const bot = new Exobot({
  plugins: [
    [shell],
    [Help],
    [Greetings],
    [Permissions],
    [Config],
  ]
});

module.exports = bot;
