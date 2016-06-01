export default class Plugin {
  help = undefined;

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
}
