import { v4 as uuid } from 'node-uuid';

import TextMessage from '../messages/text';
import PresenceMessage from '../messages/presence';

export default class Adapter {
  static STATUS = {
    UNINITIALIZED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    DISCONNECTED: 3,
    RECONNECTING: 4,
    ERROR: 5,
  }

  constructor (options={}) {
    this.options = options;
    this.id = options.id || uuid();
    this.status = Adapter.STATUS.UNINITIALIZED;
  }

  register (bot) {
    if (!bot) { throw new Error('No bot passed to register; fatal.'); }

    this.bot = bot;

    this.status = Adapter.STATUS.CONNECTING;
    this.listen();
  }

  listen () {
    if (!this.bot) { throw new Error('No bot to listen on; fatal.'); }
    this.bot.on(`send-message:${this.id}`, this.send.bind(this));
  }

  receive ({ user, text, channel, whisper }) {
    const message = new TextMessage({ user, text, channel, whisper, adapter: this.id });
    this.bot.emit('receive-message', message);
  }

  receiveWhisper ({ user, text, channel }) {
    text = this.bot.prependNameForWhisper(text);
    this.receive({ user, text, channel, whisper: true });
  }

  enter ({ user, channel }) {
    const message = new PresenceMessage({
      user,
      channel,
      adapter: this.id,
      type: PresenceMessage.TYPES.ENTER,
    });

    this.bot.emit('enter', message);
  }

  leave ({ user, channel }) {
    const message = new PresenceMessage({
      user,
      channel,
      adapter: this.id,
      type: PresenceMessage.TYPES.LEAVE,
    });

    this.bot.emit('leave', message);
  }

  send (message) {
    console.log(message.text);
  }

  ping () {
    this.pong();
  }

  pong () {
    console.log('Ping received, this.pong() not implemented.');
  }
}
