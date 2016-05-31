import Plugin from './plugin';
import TextMessage from '../messages/text';

const DEFAULT_REGEXP = /.+/;

export default class ChatPlugin extends Plugin {
  regexp = DEFAULT_REGEXP;

  respondFunctions = [];
  listenFunctions = [];

  constructor () {
    super();
  }

  register (bot) {
    this.bot = bot;
    this.botNameRegex = new RegExp(`^(?:(?:${bot.name}|${bot.alias})[,\\s:.-]*)(.+)`);

    bot.on('receive-message', m => {
      this.respondFunctions.forEach((v) => this.process(v[0], v[1], m, true));
      this.listenFunctions.forEach((v) => this.process(v[0], v[1], m));
    });
  }

  process (validation, response, message, isResponder=false) {
    if (isResponder) {
      const text = this.validateBotName(message);

      if (text) {
        message = new TextMessage({ ...message, text, direct: true });
      } else {
        return;
      }
    }

    if (validation.exec) { validation = this.validate(validation); }

    if (validation(message)) {
      const text = response(message);

      if (text) {
        const newMessage = new TextMessage({ ...message, text });
        this.bot.emit(`send-message:${message.adapter}`, newMessage);
      }
    }
  }

  validate (regex) {
    return message => regex.exec(message.text);
  }

  validateBotName (message) {
    const exec = this.botNameRegex.exec(message.text);
    if (!exec) { return; }

    return exec[1];
  }

  respond (validation, fn) {
    this.respondFunctions.push([validation, fn]);
  }

  listen (validation, fn) {
    this.listenFunctions.push([validation, fn]);
  }
}
