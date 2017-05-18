import EventEmitter from 'events';
import { AdapterOperationTypes as AT } from '../../exobot';
import { PropTypes as T } from '../../configurable';
import Adapter from '../adapter';

export default class EventAdapter extends Adapter {
  static type = 'Event';

  static propTypes = {
    userName: T.string,
  };

  static defaultProps = {
    userName: 'user',
    channel: 'event',
  };

  constructor() {
    super(...arguments);
    this.bot.emitter.on(AT.WHISPER_USER, this.whisperUser, this);
    this.emitter = new EventEmitter();
    this.emitter.on('message', this.message);

    this.status = Adapter.STATUS.CONNECTED;
  }


  async message(text) {
    this.user = await this.getUser(this.options.userName, this.options.userName);
    const res = /^\/w (.+)$/i.exec(text);

    if (res) {
      super.receiveWhisper({
        text: res[1],
        channel: this.channel,
        user: this.user,
        whisper: true,
      });
    } else {
      super.receive({
        text,
        channel: this.channel,
        user: this.user,
        whisper: false,
      });
    }


    this.prompt();
  }

  send(message) {
    if (message.whisper) {
      /* eslint class-methods-use-this: 0, no-console: 0 */
      this.emitter.emit('whisper', message.text);
    } else {
      /* eslint class-methods-use-this: 0, no-console: 0 */
      this.emitter.emit('send', message.text);
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
