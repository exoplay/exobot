module.exports = {
  plugins: {
    shell: ['@exoplay/exobot', { import: 'adapters.Shell' }],
    uptime: ['@exoplay/exobot', { import: 'plugins.Uptime' }],
    help: ['@exoplay/exobot', { import: 'plugins.Help' }],
    greetings: ['@exoplay/exobot', { import: 'plugins.Greetings' }],
    permissions: ['@exoplay/exobot', { import: 'plugins.Permissions' }],
    config: ['@exoplay/exobot', { import: 'plugins.Config' }],
  },
};
