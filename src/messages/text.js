import Message from './message';

export default class TextMessage extends Message {
  constructor(message) {
    super(message);

    const {
      text, whisper = false, respond = false, params = {},
    } = message;

    if (text) {
      this.text = text.trim();
    }

    this.whisper = whisper;
    this.respond = respond;
    this.params = params;
  }
}
