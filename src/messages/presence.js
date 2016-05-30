import Message from './message';

export const PRESENCE_TYPES = {
  ENTER: 'ENTER',
  LEAVE: 'LEAVE',
};

export default class PresenceMessage extends Message {
  constructor ({ type }) {
    super(...arguments);
    this.type = type;
  }
}
