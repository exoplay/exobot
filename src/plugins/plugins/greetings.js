import ChatPlugin from '../chat';

const GREETINGS = [
  'hi',
  'hello',
  'sup',
  'greetings',
  'yo',
];

const greetingRegex = botname => new RegExp(`^(${GREETINGS.join('|')})[,\\s]*${botname}`, 'i');

export default class GreetingPlugin extends ChatPlugin {
  help = 'Greetings: says "hi" back. Say "hi <botname>" for a response.';

  register (bot) {
    super.register(...arguments);
    this.listen(greetingRegex(bot.name), this.greeting);
    this.listen((m) => GREETINGS.includes(m.text.toLowerCase()), this.greeting);
  }

  greeting (message) {
    const randomGreeting = GREETINGS[parseInt(Math.random() * GREETINGS.length)];
    return `${randomGreeting}, ${message.user.name}!`;
  }
}
