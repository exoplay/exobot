import Plugin from './plugin';
import TextMessage from '../messages/text';

const DEFAULT_REGEXP = /.+/;

export default class ChatPlugin extends Plugin {
  regexp = DEFAULT_REGEXP;

  constructor () {
    super();
  }

  register (bot) {
    bot.on('receive-message', m => {
      if (this.validate(m)) {
        const text = this.respond(m);

        if (text) {
          const newMessage = new TextMessage({ ...m, text });
          bot.emit(`send-message:${m.adapter}`, newMessage);
        }
      }
    });
  }

  validate (message) {
    if (this.regexp.exec(message.text)) {
      return true;
    }

    return false;
  }

  respond (/*message*/) {
    return 'message received.';
  }
}
