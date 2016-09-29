import readline from 'readline';

import { PropTypes as T } from '../../exobot';
import Adapter from '../adapter';

const SHELL = 'SHELL';

const EXIT_COMMANDS = [
  'exit',
  'quit',
  'q',
];

export default class ShellAdapter extends Adapter {
  name = 'shell';

  propTypes = {
    userName: T.string,
  };

  defaultProps = {
    userName: 'shell',
  };

  constructor () {
    super();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

  }

  async prompt () {
    this.user = await this.getUser(this.options.userName, this.options.userName);
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

  getRoles() {
    return false;
  }
}
