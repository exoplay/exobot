const { Exobot, Adapters, Plugins } = require('../exobot');

const {
  Help,
  Greetings,
  Permissions,
  Config,
  Uptime,
} = Plugins;

const { Shell, HTTP } = Adapters;

const bot = new Exobot({
  name: 'exobot',
  alias: '/',
  key: 'exobot-encryption-key',
  plugins: {
    shell: [Shell],
    http: [HTTP],
    help: [Help],
    greetings: [Greetings],
    permissions: [Permissions, { adminPassword: 'CHANGEME' }],
    config: [Config],
    uptime: [Uptime],
  },
  // requirePermissions: true
});

module.exports = bot;
