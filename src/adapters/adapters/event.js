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
    this.emitter.on('message', this.message.bind(this));

    this.status = Adapter.STATUS.CONNECTED;
  }

  async message(text) {
    this.user = await this.getUser(this.options.userName, this.options.userName);
    const res = /^\/w (.+)$/i.exec(text);

    const params = {
      text,
      channel: this.options.channel,
      user: this.user,
      whisper: false,
    };

    if (res) {
      super.receiveWhisper({ ...params, text: res[1], whisper: true });
      this.emitter.emit('receive', { ...params, text: res[1], whisper: true });
    } else {
      super.receive(params);
      this.emitter.emit('receive', params);
    }
  }

  send(message) {
    if (message.whisper) {
      /* eslint class-methods-use-this: 0, no-console: 0 */
      this.emitter.emit('whisper', { ...message, user: { name: this.bot.name } });
    } else {
      /* eslint class-methods-use-this: 0, no-console: 0 */
      this.emitter.emit('send', { ...message, user: { name: this.bot.name } });
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
