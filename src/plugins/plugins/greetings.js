import { Plugin, listen, help, permissionGroup } from '../plugin';

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
  'farewell',
  'bye',
  'later',
  'cya',
];

export class Greetings extends Plugin {
  static type = 'greeting';
  static propTypes = {};

  @help('Greets you back when you greet the channel.');
  @permissionGroup('greetings');
  @listen(':greeting*');
  greeting (message) {
    if (!GREETINGS.includes(message.params.greeting.toLowerCase())) { return; }

    const randomGreeting = GREETINGS[parseInt(Math.random() * GREETINGS.length)];
    return `${randomGreeting}, ${message.user.name}!`;
  }

  @help('Says goodbye when you do.');
  @permissionGroup('greetings');
  @listen(':farewell*');
  farewell (message) {
    if (!FAREWELLS.includes(message.params.farewell.toLowerCase())) { return; }

    const randomFarewell = FAREWELLS[parseInt(Math.random() * FAREWELLS.length)];
    return `${randomFarewell}, ${message.user.name}!`;
  }
}
