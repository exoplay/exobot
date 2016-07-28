import { ChatPlugin, listen, help, permissionGroup } from '../chat';

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

const shouldGreet = (m) => GREETINGS.includes(m.text.toLowerCase());
const shouldFarewell = (m) => FAREWELLS.includes(m.text.toLowerCase());

export class Greetings extends ChatPlugin {
  name = 'greeting';

  @help('Greets you back when you greet the channel.');
  @permissionGroup('greetings');
  @listen(shouldGreet)
  greeting (_, message) {
    const randomGreeting = GREETINGS[parseInt(Math.random() * GREETINGS.length)];
    return `${randomGreeting}, ${message.user.name}!`;
  }

  @help('Says goodbye when you do.');
  @permissionGroup('greetings');
  @listen(shouldFarewell)
  farewell (_, message) {
    const randomFarewell = FAREWELLS[parseInt(Math.random() * FAREWELLS.length)];
    return `${randomFarewell}, ${message.user.name}!`;
  }
}
