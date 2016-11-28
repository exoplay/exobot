import { Configurable } from '../configurable';

export default class Plugin extends Configurable {
  help = undefined;
  _requiresDatabase = false;
  propTypes = null;
  defaultProps = {};

  constructor (options, bot) {
    super(options, bot);

    if (!this.constructor._name) {
      throw new Error('This plugin has a missing `name` property.');
    }

    this.database();
  }

  listen () {
    if (!this.bot) {
      throw new Error('No bot to listen on; fatal.');
    }
  }

  database () {
    if (this.defaultDatabase) {
      Object.keys(this.defaultDatabase).forEach(name => {
        const val = this.bot.db.get(name).value();

        if (typeof val === 'undefined') {
          this.bot.db.set(name, this.defaultDatabase[name]).value();
        }
      });
    }
  }
}
