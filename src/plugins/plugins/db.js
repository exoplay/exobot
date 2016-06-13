import ChatPlugin from '../chat';

export default class DBPlugin extends ChatPlugin {
  help = 'dbdump: dump the database. Say "<botname> dbdump".';

  constructor () {
    super(...arguments);
    this.respond(/^db dump/, this.dump);
    this.respond(/^db clear/, this.clear);
  }

  async dump () {
    await this.databaseInitialized();
    return this.bot.db.getState();
  }

  async clear () {
    await this.databaseInitialized();

    this.bot.log.critical('Database clearing. You may need to restart your bot.');
    this.bot.db.setState();

    // reinitialize plugins so that those with default databases can re-set-up
    this.bot.initializePlugins();
  }
}
