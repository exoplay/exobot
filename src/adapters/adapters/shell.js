import readline from 'readline';

import Adapter from '../adapter';
import User from '../../user';

const SHELL = 'SHELL';
const SHELL_USER = new User('shell');

export default class ShellAdapter extends Adapter {
  constructor () {
    super();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  prompt () {
    this.rl.question('Chat: ', (answer) => {
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
  }
}
