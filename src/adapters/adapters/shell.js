import readline from 'readline';
import { AdapterOperationTypes as AT} from '../../exobot';
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

  constructor() {
    super(...arguments);

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.bot.emitter.on(AT.WHISPER_USER, this.whisperUser, this);
    this.prompt();
    this.status = Adapter.STATUS.CONNECTED;
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
      }
      else {
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
    if(message.whisper) {
      console.log(`W: ${message.text}`);
    } else {
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
          whisper: true
        });
      }
    }
  }
}
