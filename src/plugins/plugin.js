export default class Plugin {
  constructor (options={}) {
    this.options = options;
  }

  register (bot) {
    if (!bot) { throw new Error('No bot passed to register; fatal.'); }

    this.bot = bot;
    this.listen();
  }

  listen () {
    if (!this.bot) { throw new Error('No bot to listen on; fatal.'); }
  }
}
