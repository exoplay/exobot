require('babel-polyfill');
require('source-map-support');

const { Exobot, adapters, plugins } = require('../exobot');
const { Help, Greetings, Permissions, Config, Uptime } = plugins;

const shell = adapters.Shell;

const bot = new Exobot({
  plugins: [
    [shell],
    [Help],
    [Greetings],
    [Permissions],
    [Config],
    [Uptime],
  ],
  requirePermissions: true
});

module.exports = bot;
