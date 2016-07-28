import { ChatPlugin, respond, help, permissionGroup } from '../chat';

export class Help extends ChatPlugin {
  name = 'help';

  @help('/help explains commands.');
  @permissionGroup('help');
  @respond(/^help$/i);
  pluginHelp () {
    return this.bot.plugins
                    .filter(p => p.help && p.help.length > 0)
                    .map(p => p.helpText().join('\n'), [])
                    .join('\n');
  }

  @help('/help <search> finds information about a specific command.');
  @permissionGroup('help');
  @respond(/^help (\w+)$/i);
  pluginHelpSearch ([, search]) {
    return this.bot.plugins
                    .filter(p => p.help && p.help.length > 0)
                    .map(p => {
                      return p.helpText().filter(t => {
                        return t.toLowerCase().indexOf(search.toLowerCase()) > -1;
                      }).join('\n');
                    }, [])
                    .join('\n');
  }
}
