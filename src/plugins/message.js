import Plugin from './plugin';
import Chat from './chat';
import TextMessage from '../messages/text';

const DEFAULT_REGEX = /.+/;

export default class MessagePlugin extends Chat {
  regex = DEFAULT_REGEX;

  constructor () {
    super();
  }

  register (bot) {
    this.botNameRegex = new RegExp(`^(?:(?:${bot.name}|${bot.alias})[,\\s:.-]*)(.+)`);

    bot.on('receive-message', m => {
      const strippedMessage = this.validateBotName(m);

      if (strippedMessage) {
        let message = new TextMessage({ ...m, text: strippedMessage });

        if (this.validate(message)) {
          const text = this.respond(message);

          if (text) {
            const newMessage = new TextMessage({
              ...m,
              text
            });

            bot.emit(`send-message:${m.adapter}`, newMessage);
          }
        }
      }
    });
  }

  validateBotName (message) {
    const exec = this.botNameRegex.exec(message.text);
    if (!exec) { return; }

    return exec[1];
  }

  validate (message) {
    if (this.regex.exec(message.text)) {
      return true;
    }

    return false;
  }

  respond (/*message*/) {
    return 'message received.';
  }
}
