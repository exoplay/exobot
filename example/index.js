require('babel-polyfill');
require('source-map-support');

const { Exobot, adapters, plugins } = require('../exobot');
const { Help, Greetings, Permissions, Config, Uptime } = plugins;

const shell = adapters.Shell;

const bot = new Exobot({
  plugins: {
    shell: [shell],
    help: [Help],
    greetings: [Greetings],
    permissions: [Permissions],
    config: [Config],
    uptime: [Uptime],
  },
  requirePermissions: true
});

module.exports = bot;
