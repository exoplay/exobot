import ChatPlugin from '../chat';

const GREETINGS = [
  'hi',
  'hello',
  'sup',
  'greetings',
  'yo',
  'hey',
];

const FAREWELLS = [
  'goodbye',
  'farwell',
  'bye',
  'later',
  'see ya',
  'cya',
];

const regex = (botname, list) => new RegExp(`^(${list.join('|')})[,\\s]*${botname}`, 'i');

export default class GreetingPlugin extends ChatPlugin {
  help = 'Greetings: says "hi" back. Say "hi <botname>" for a response.';

  register (bot) {
    super.register(...arguments);

    this.listen(regex(bot.name, GREETINGS), this.greeting);
    this.listen((m) => GREETINGS.includes(m.text.toLowerCase()), this.greeting);
    this.respond((m) => GREETINGS.includes(m.text.toLowerCase()), this.greeting);

    this.listen(regex(bot.name, FAREWELLS), this.farewell);
    this.listen((m) => FAREWELLS.includes(m.text.toLowerCase()), this.farewell);
    this.respond((m) => FAREWELLS.includes(m.text.toLowerCase()), this.farewell);
  }

  greeting (_, message) {
    const randomGreeting = GREETINGS[parseInt(Math.random() * GREETINGS.length)];
    return `${randomGreeting}, ${message.user.name}!`;
  }

  farewell (_, message) {
    const randomFarewell = FAREWELLS[parseInt(Math.random() * FAREWELLS.length)];
    return `${randomFarewell}, ${message.user.name}!`;
  }
}
