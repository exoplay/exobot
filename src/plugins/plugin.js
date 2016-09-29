import { Configurable } from '../configurable';

export default class Plugin extends Configurable {
  help = undefined;
  _requiresDatabase = false;
  propTypes = null;
  defaultProps = {};

  register (bot) {
    this.bot = bot;

    if (!bot) { throw new Error('No bot passed to register; fatal.'); }

    if (!this.name) {
      throw new Error('This plugin has a missing `name` property.');
    }

    this.configure(this.options, bot);

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
