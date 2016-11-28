import Message from './message';

export default class PresenceMessage extends Message {
  static TYPES = {
    ENTER: 0,
    LEAVE: 1,
  }

  constructor({ type }) {
    super(...arguments);
    this.type = type;
  }
}
