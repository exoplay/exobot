import { Plugin, respond, help, permissionGroup } from '../plugin';

export default class Help extends Plugin {
  static type = 'help';
  static propTypes = {};

  @help('/help explains commands.');
  @permissionGroup('help');
  @respond(/^help$/i);
  pluginHelp() {
    return Object.keys(this.bot.plugins).map(p => this.bot.plugins[p])
                    .filter(p => p.constructor.help && p.constructor.help.length > 0)
                    .map(p => p.helpText().join('\n'), [])
                    .join('\n');
  }

  @help('/help <search> finds information about a specific command.');
  @permissionGroup('help');
  @respond(/^help (\w+)$/i);
  pluginHelpSearch([, search]) {
    return Object.keys(this.bot.plugins).map(p => this.bot.plugins[p])
                    .filter(p => p.constructor.help && p.constructor.help.length > 0)
                    .map(p => p.helpText().filter(t => t.toLowerCase().indexOf(search.toLowerCase()) > -1).join('\n'), [])
                    .join('\n');
  }
}
