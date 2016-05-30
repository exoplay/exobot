import ChatPlugin from '../chat';

const GREETINGS = [
  'hi',
  'hello',
  'sup',
];

export default class GreetingPlugin extends ChatPlugin {
  register (bot) {
    super.register(...arguments);
    this.regexp = new RegExp(`^(${GREETINGS.join('|')})[,\\s]*${bot.name}`);
  }

  respond (message) {
    const randomGreeting = GREETINGS[parseInt(Math.random() * GREETINGS.length)];
    return `${randomGreeting}, ${message.user.name}!`;
  }
}
