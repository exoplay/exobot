import readline from 'readline';

import { PropTypes as T } from '../../configurable';
import Adapter from '../adapter';

const SHELL = 'SHELL';

const EXIT_COMMANDS = [
  'exit',
  'quit',
  'q',
];

export default class ShellAdapter extends Adapter {
  static type = 'Shell';

  static propTypes = {
    userName: T.string,
  };

  static defaultProps = {
    userName: 'shell',
  };

  constructor () {
    super(...arguments);

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.prompt();
    this.status = Adapter.STATUS.CONNECTED;
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

  getUserIdByUserName () {
    return this.user.id;
  }

  getRoles() {
    return false;
  }
}
