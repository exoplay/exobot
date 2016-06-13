export default class Plugin {
  help = undefined;
  _requiresDatabase = false;

  constructor (options={}) {
    this.options = options;
  }

  register (bot) {
    if (!bot) { throw new Error('No bot passed to register; fatal.'); }

    this.bot = bot;
  }

  listen () {
    if (!this.bot) { throw new Error('No bot to listen on; fatal.'); }
  }

  async database (name, defaultValue) {
    await this.databaseInitialized();
    const val = this.bot.db.get(name).value();

    if (typeof val === 'undefined') {
      this.bot.db.set(name, defaultValue).value();
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
