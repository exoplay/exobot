import Message from './message';

export default class TextMessage extends Message {
  constructor ({ text, whisper=false }) {
    super(...arguments);
    this.text = text.trim();
    this.whisper = !!whisper;
  }
}
