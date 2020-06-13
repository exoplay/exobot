import readline from 'readline';
import Adapter, { AdapterOperationTypes as AT } from '../adapter';
import { PropTypes as T } from '../../configurable';

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

  constructor(options, bot, log) {
    super(options, bot, log);

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.bot.emitter.on(AT.WHISPER_USER, this.whisperUser, this);
    this.prompt();
    this.status = Adapter.STATUS.CONNECTED;
  }

  shutdown() {
    this.rl.close();
  }

  async prompt() {
    this.user = await this.getUser(this.options.userName, this.options.userName);
    this.rl.question('Chat: ', (answer) => {
      if (EXIT_COMMANDS.includes(answer)) {
        this.bot.db.write().then(() => process.exit());
      }
      const res = /^\/w (.+)$/i.exec(answer);
      if (res) {
        super.receiveWhisper({
          text: res[1],
          channel: SHELL,
          user: this.user,
          whisper: true,
        });
      } else {
        super.receive({
          text: answer,
          channel: SHELL,
          user: this.user,
          whisper: false,
        });
      }

      this.prompt();
    });
  }

  send(message) {
    if (message.whisper) {
      /* eslint class-methods-use-this: 0, no-console: 0 */
      console.log(`W: ${message.text}`);
    } else {
      /* eslint class-methods-use-this: 0, no-console: 0 */
      console.log(message.text);
    }
  }

  getUserIdByUserName() {
    return this.user.id;
  }

  getRoles() {
    return false;
  }

  whisperUser(adapterName, options) {
    if (!adapterName || adapterName === this.name) {
      const adapterUserId = this.getAdapterUserIdById(options.userId);
      if (adapterUserId) {
        this.send({
          text: options.messageText,
          whisper: true,
        });
      }
    }
  }
}
