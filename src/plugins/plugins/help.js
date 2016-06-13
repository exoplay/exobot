import ChatPlugin from '../chat';

export default class HelpPlugin extends ChatPlugin {
  help = 'Help: Explains commands. Say "<botname> help" for information.';

  constructor () {
    super(...arguments);
    this.respond(/^help$/i, this.pluginHelp);
  }

  pluginHelp = () => {
    return this.bot.plugins
                    .filter(p => p.help)
                    .map(p => p.help, []).join('\n');
  }
}
