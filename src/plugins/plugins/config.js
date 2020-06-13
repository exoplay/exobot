import {
  Plugin, respond, help, permissionGroup,
} from '../plugin';

export default class Config extends Plugin {
  static type = 'config';

  static propTypes = {};

  @help('/config set <pluginname> <key> <value> updates plugin configuration.')
  @permissionGroup('config')
  @respond(/^config set (\S+) (\S+) (\S+)/i)
  pluginConfigSet([, name, key, value]) {
    this.bot.setConfiguration(name, key, value);
    return `Plugin ${name} set ${key} = ${value}.`;
  }

  @help('/config get <pluginname> <key?> retrieves plugin config info.')
  @permissionGroup('config')
  @respond(/^config get (\S+) ?(\S+)?$/i)
  pluginConfigGet([, name, key]) {
    const config = this.bot.getConfiguration(name, key);
    return JSON.stringify(config);
  }

  @help('/config reset <pluginname> resets all plugin configuration.')
  @permissionGroup('config')
  @respond(/^config reset (\S+)$/i)
  pluginConfigReset([, name]) {
    this.bot.resetConfiguration(name);
    return `Configuration for  ${name} reset.`;
  }
}
