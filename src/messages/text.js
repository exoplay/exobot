import Message from './message';

export default class TextMessage extends Message {
  constructor ({ text, whisper=false }) {
    super(...arguments);

    if (text) {
      this.text = text.trim();
    }

    this.whisper = !!whisper;
  }
}
