import { Plugin, listen, respond, help, permissionGroup } from '../plugin';

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

let GREETINGS_REGEX;
const getGreetingsRegex = (bot) => {
  if (GREETINGS_REGEX) { return GREETINGS_REGEX; }

  GREETINGS_REGEX =
    new RegExp(`^(?:${GREETINGS.join('|')})[\\s,:]*(?:@?${bot.options.name})?[!\\.]*$`, 'i');

  return GREETINGS_REGEX;
};

let FAREWELLS_REGEX;
const getFarewellsRegex = (bot) => {
  if (FAREWELLS_REGEX) { return FAREWELLS_REGEX; }

  FAREWELLS_REGEX =
    new RegExp(`^(?:${FAREWELLS.join('|')})[\\s,:]*(?:@?${bot.options.name})?[!\\.]*$`, 'i');

  return FAREWELLS_REGEX;
};

const shouldGreet = (m, bot) => getGreetingsRegex(bot).exec(m.text);
const shouldFarewell = (m, bot) => getFarewellsRegex(bot).exec(m.text);

export class Greetings extends Plugin {
  static type = 'greeting';
  static propTypes = {};

  @help('Greets you back when you greet the channel.');
  @permissionGroup('greetings');
  @listen(shouldGreet);
  @respond(shouldGreet);
  greeting(_, message) {
    const randomGreeting = GREETINGS[parseInt(Math.random() * GREETINGS.length, 10)];
    return `${randomGreeting}, ${message.user.name}!`;
  }

  @help('Says goodbye when you do.');
  @permissionGroup('greetings');
  @listen(shouldFarewell);
  @respond(shouldFarewell);
  farewell(_, message) {
    const randomFarewell = FAREWELLS[parseInt(Math.random() * FAREWELLS.length, 10)];
    return `${randomFarewell}, ${message.user.name}!`;
  }
}
