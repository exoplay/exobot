import { v4 as uuid } from 'node-uuid';

export default class Message {
  constructor ({ user, channel, adapter, id=uuid() }) {
    this.user = user;
    this.channel = channel;
    this.adapter = adapter;
    this.id = id;
  }
}
