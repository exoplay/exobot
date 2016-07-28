import readline from 'readline';

import Adapter from '../adapter';
import User from '../../user';

const SHELL = 'SHELL';
const SHELL_USER = new User('shell');

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

  prompt () {
    this.rl.question('Chat: ', (answer) => {
      if (EXIT_COMMANDS.includes(answer)) {
        return process.exit();
      }

      super.receive({
        text: answer,
        channel: SHELL,
        user: SHELL_USER,
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
    return 'shell';
  }
}
