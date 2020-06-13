import { v4 as uuid } from 'node-uuid';

export default class Message {
  constructor(message) {
    const {
      user, channel, adapter, id = uuid(),
    } = message;

    this.user = user;
    this.channel = channel;
    this.adapter = adapter;
    this.id = id;
  }
}
