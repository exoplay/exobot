import MessagePlugin from '../message';

export default class HelpPlugin extends MessagePlugin {
  regexp = /^help$/

  respond () {
    return 'HELP!';
  }
}
