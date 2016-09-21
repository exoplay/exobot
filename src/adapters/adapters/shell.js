import readline from 'readline';

import Adapter from '../adapter';

const SHELL = 'SHELL';

const EXIT_COMMANDS = [
  'exit',
  'quit',
  'q',
];

export default class ShellAdapter extends Adapter {
  name = 'shell';

  constructor () {
    super();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

  }

  async prompt () {
    await this.bot.databaseInitialized();
    this.user = await this.getUser('shell', 'shell');
    this.rl.question('Chat: ', (answer) => {
      if (EXIT_COMMANDS.includes(answer)) {
        this.bot.db.write().then(() => process.exit());
      }

      super.receive({
        text: answer,
        channel: SHELL,
        user: this.user,
      });

      this.prompt();
    });
  }

  register (bot) {
    super.register(bot);
    this.prompt();
    this.status = Adapter.STATUS.CONNECTED;

  }

  getUserIdByUserName () {
    return this.user.id;
  }
}
