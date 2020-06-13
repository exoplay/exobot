import { v4 as uuid } from 'node-uuid';

export default class User {
  constructor(name, id, adapter) {
    this.name = name;
    this.id = id || uuid();
    this.roles = {};
    this.adapters = adapter || {};
  }
}
