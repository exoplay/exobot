import ChatPlugin from '../chat';

export default class HelpPlugin extends ChatPlugin {
  constructor () {
    super(...arguments);

    this.respond(/^help$/, this.help);
  }

  help () {
    return 'HELP!';
  }
}
