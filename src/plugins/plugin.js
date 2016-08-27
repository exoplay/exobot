export default class Plugin {
  help = undefined;
  _requiresDatabase = false;

  constructor (options={}) {
    this.options = options;
  }

  register (bot) {
    if (!bot) { throw new Error('No bot passed to register; fatal.'); }

    if (!this.name) {
      throw new Error(
        'This plugin has a missing `name` property; some functionality will not work.'
      );
    }

    this.bot = bot;
    this.database();
  }

  listen () {
    if (!this.bot) {
      throw new Error('No bot to listen on; fatal.');
    }
  }

  async database () {
    if (this.defaultDatabase) {
      await this.databaseInitialized();

      Object.keys(this.defaultDatabase).forEach(name => {
        const val = this.bot.db.get(name).value();

        if (typeof val === 'undefined') {
          this.bot.db.set(name, this.defaultDatabase[name]).value();
        }
      });
    }
  }

  async databaseInitialized () {
    this._requiresDatabase = true;

    if (this._requiresDatabase && this.bot.db) {
      return true;
    }

    return new Promise((resolve) => {
      this.bot.emitter.on('dbLoaded', resolve);
    });
  }
}
