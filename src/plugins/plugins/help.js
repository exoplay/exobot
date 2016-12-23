import { Plugin, respond, help, permissionGroup } from '../plugin';

export class Help extends Plugin {
  static type = 'help';
  static propTypes = {};

  @help('/help explains commands.');
  @permissionGroup('help');
  @respond('help');
  pluginHelp () {
    return Object.keys(this.bot.plugins).map(p => this.bot.plugins[p])
                    .filter(p => p.constructor.help && p.constructor.help.length > 0)
                    .map(p => p.helpText().join('\n'), [])
                    .join('\n');
  }

  @help('/help <search> finds information about a specific command.');
  @permissionGroup('help');
  @respond('help :search');
  pluginHelpSearch (message) {
    const { search } = message.params;
    return Object.keys(this.bot.plugins).map(p => this.bot.plugins[p])
                    .filter(p => p.constructor.help && p.constructor.help.length > 0)
                    .map(p => {
                      return p.helpText().filter(t => {
                        return t.toLowerCase().indexOf(search.toLowerCase()) > -1;
                      }).join('\n');
                    }, [])
                    .join('\n');
  }
}
