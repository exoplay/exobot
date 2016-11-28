import { Configurable } from '../configurable';

import PresenceMessage from '../messages/presence';
import User from '../user';

export default class Adapter extends Configurable {
  static STATUS = {
    UNINITIALIZED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    DISCONNECTED: 3,
    RECONNECTING: 4,
    ERROR: 5,
  }

  get roleMapping () {
    return this.options.roleMapping;
  }

  status = Adapter.STATUS.UNINITIALIZED;

  constructor (options, bot) {
    super(...arguments);

    if (!bot) { throw new Error('No bot passed to register; fatal.'); }

    if (!this.constructor._name) {
      throw new Error('This adapter has no `name` property; some plugins will not work.');
    }

    this.bot = bot;
    this.initUsers();
    this.status = Adapter.STATUS.CONNECTING;
  }

  receive ({ user, text, channel, whisper }) {
    if (!text) {
      this.bot.log.info('Message received with undefined text.');
      return;
    }

    const message = this.bot.parseMessage({
      user,
      text,
      channel,
      whisper,
      adapter: this.constructor._name
    });

    this.bot.emitter.emit('receive-message', message);
  }

  receiveWhisper ({ user, text, channel }) {
    if (!text) {
      this.bot.log.warning('Message received with undefined text.');
      return;
    }

    this.receive({ user, text, channel, whisper: true });
  }

  enter ({ user, channel }) {
    const message = new PresenceMessage({
      user,
      channel,
      adapter: this.constructor._name,
      type: PresenceMessage.TYPES.ENTER,
    });

    this.bot.emitter.emit('enter', message);
  }

  leave ({ user, channel }) {
    const message = new PresenceMessage({
      user,
      channel,
      adapter: this.constructor._name,
      type: PresenceMessage.TYPES.LEAVE,
    });

    this.bot.emitter.emit('leave', message);
  }

  send (message) {
    console.log(message.text);
  }

  ping () {
    this.pong();
  }

  pong () {
    this.bot.log.warning('Ping received, this.pong() not implemented.');
  }

  getUserIdByUserName (name) {
    this.bot.log.warning('getUserIdByUserName not implemented by this adapter.');
    return name;
  }

  getRoleIdByRoleName (name) {
    this.bot.log.warning('getRoleIdByRoleName not implemented by this adapter');
    return name;
  }

  getRolesForUser () {
    return [];
  }

  async initUsers() {
    this.adapterUsers = this.bot.users[this.constructor._name];
    if (this.adapterUsers) {
      return;
    }

    this.bot.users[this.name] = {};
    this.adapterUsers = this.bot.users[this.constructor._name];
    this.bot.db.write();
  }

  getRoles() {
    this.bot.log.warning('getRoles not implemented by this adapter');
    return false;
  }

  async getUser(adapterUserId, adapterUsername, adapterUser = {}) {
    if (!adapterUserId) {
      this.bot.log.error(`Adapter ${this.constructor._name} called getUser without adapterUserId`);
    }
    if (!adapterUsername) {
      this.bot.log.warning(`Adapter ${this.constructor._name} called getUser without adapterUsername`);
    }

    const roles = this.getRoles(adapterUserId, adapterUser);
    if (this.adapterUsers) {
      if (this.adapterUsers[adapterUserId]) {
        if (roles) {
          console.log('1');
          this.adapterUsers[adapterUserId].roles = roles;
        }

        if (adapterUsername) {
          this.bot.users.botUsers[this.adapterUsers[adapterUserId].botId].name = adapterUsername;
        }

        return this.bot.users.botUsers[this.adapterUsers[adapterUserId].botId];
      }

      const user = new User(adapterUsername);
      user.adapters = { [this.constructor._name]: { userId: adapterUserId } };

      this.adapterUsers[adapterUserId] = {
        name: adapterUsername,
        botId: user.id,
        roles: roles || [],
      };

      this.bot.users.botUsers[user.id] = user;
      this.bot.db.write();
      return user;
    }

    return new User(
      adapterUsername,
      adapterUserId,
      { [this.constructor._name]: adapterUserId }
    );
  }

}
