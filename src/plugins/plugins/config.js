import { Plugin, respond, help, permissionGroup } from '../plugin';

export class Config extends Plugin {
  static type = 'config';
  static propTypes = {};

  @help('/config set <pluginname> <key> <value> updates plugin configuration.');
  @permissionGroup('config');
  @respond('config set :name :key :value');
  pluginConfigSet (message) {
    const { name, key, value } = message.params;
    this.bot.setConfiguration(name, key, value);
    return `Plugin ${name} set ${key} = ${value}.`;
  }

  @help('/config get <pluginname> <key?> retrieves plugin config info.');
  @permissionGroup('config');
  @respond('config get :name :key*');
  pluginConfigGet (message) {
    const { name, key } = message.params;

    const config = this.bot.getConfiguration(name, key);
    return JSON.stringify(config);
  }

  @help('/config reset <pluginname> resets all plugin configuration.');
  @permissionGroup('config');
  @respond('config reset :name');
  pluginConfigReset (message) {
    const { name } = message.params;
    this.bot.resetConfiguration(name);
    return `Configuration for  ${name} reset.`;
  }
}
