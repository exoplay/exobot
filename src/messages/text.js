import Message from './message';

export default class TextMessage extends Message {
  constructor ({ text, whisper=false, respond=false }) {
    super(...arguments);

    if (text) {
      this.text = text.trim();
    }

    this.whisper = whisper;
    this.respond = respond;
  }
}
