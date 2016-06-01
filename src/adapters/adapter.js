import { v4 as uuid } from 'node-uuid';

import TextMessage from '../messages/text';
import PresenceMessage from '../messages/presence';

export default class adapter {
  constructor (options={}) {
    this.options = options;
    this.id = options.id || uuid();
  }

  register (bot) {
    if (!bot) { throw new Error('No bot passed to register; fatal.'); }

    this.bot = bot;
    this.listen();
  }

  listen () {
    if (!this.bot) { throw new Error('No bot to listen on; fatal.'); }
    this.bot.on(`send-message:${this.id}`, this.send.bind(this));
  }

  receive ({ user, text, channel }) {
    const message = new TextMessage({ user, text, channel, adapter: this.id });
    this.bot.emit('receive-message', message);
  }

  receiveWhisper ({ user, text, channel }) {
    text = this.bot.prependNameForWhisper(text);
    this.receive({ user, text, channel });
  }

  enter ({ user, channel }) {
    const message = new PresenceMessage({
      user,
      channel,
      adapter: this.id,
      type: PresenceMessage.PRESENCE_TYPES.ENTER,
    });

    this.bot.emit('receive-message', message);
  }

  leave ({ user, channel }) {
    const message = new PresenceMessage({
      user,
      channel,
      adapter: this.id,
      type: PresenceMessage.PRESENCE_TYPES.LEAVE,
    });

    this.bot.emit('receive-message', message);
  }

  send (message) {
    console.log(message.text);
  }
}
