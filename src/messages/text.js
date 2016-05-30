import Message from './message';

export default class TextMessage extends Message {
  constructor ({ text }) {
    super(...arguments);
    this.text = text;
  }
}
