import TextMessage from '../messages/text';
import PresenceMessage from '../messages/presence';
import User from '../user';
export default class Adapter {
  static STATUS = {
    UNINITIALIZED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    DISCONNECTED: 3,
    RECONNECTING: 4,
    ERROR: 5,
  }

  constructor (options={}) {
    this.options = options;
    this.status = Adapter.STATUS.UNINITIALIZED;
    this.roleMapping = options.roleMapping;
  }

  register (bot) {
    if (!bot) { throw new Error('No bot passed to register; fatal.'); }
    if (!this.name) {
      throw new Error('This adapter has no `name` property; some plugins will not work.');
    }

    this.bot = bot;
    this.initUsers();
    this.status = Adapter.STATUS.CONNECTING;
    this.listen();

  }

  listen () {
    if (!this.bot) { throw new Error('No bot to listen on; fatal.'); }
  }

  receive ({ user, text, channel, whisper }) {
    if (!text) {
      this.bot.log.warning('Message received with undefined text.');
      return;
    }

    const message = new TextMessage({ user, text, channel, whisper, adapter: this.name });
    this.bot.emitter.emit('receive-message', message);
  }

  receiveWhisper ({ user, text, channel }) {
    if (!text) {
      this.bot.log.warning('Message received with undefined text.');
      return;
    }

    text = this.bot.prependNameForWhisper(text);
    this.receive({ user, text, channel, whisper: true });
  }

  enter ({ user, channel }) {
    const message = new PresenceMessage({
      user,
      channel,
      adapter: this.name,
      type: PresenceMessage.TYPES.ENTER,
    });

    this.bot.emitter.emit('enter', message);
  }

  leave ({ user, channel }) {
    const message = new PresenceMessage({
      user,
      channel,
      adapter: this.name,
      type: PresenceMessage.TYPES.LEAVE,
    });

    this.bot.emitter.emit('leave', message);
  }

  send (message) {
    this.bot.log.warning(message.text);
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
    await this.bot.databaseInitialized();
    this.adapterUsers = this.bot.users[this.name];
    if (this.adapterUsers) {
      return;
    }

    this.bot.users[this.name] = {};
    this.adapterUsers = this.bot.users[this.name];
    this.bot.db.write();
  }

  getRoles() {
    this.bot.log.warning('getRoles not implemented by this adapter');
    return false;
  }

  async getUser(adapterUserId, adapterUsername, adapterUser = {}) {
    await this.bot.databaseInitialized();
    if (!adapterUserId) {
      this.bot.error(`Adapter ${this.name} called getUser without adapterUserId`);
    }
    if (!adapterUsername) {
      this.bot.warning(`Adapter ${this.name} called getUser without adapterUsername`);
    }

    const roles = this.getRoles(adapterUserId, adapterUser);
    if (this.adapterUsers) {
      if (this.adapterUsers[adapterUserId]) {
        if (roles) {
          this.adapterUsers[adapterUserId].roles = roles;
        }

        if (adapterUsername) {
          this.bot.users.botUsers[this.adapterUsers[adapterUserId].botId].name = adapterUsername;
        }

        return this.bot.users.botUsers[this.adapterUsers[adapterUserId].botId];
      }

      const user = new User(adapterUsername);
      user.adapters = {[this.name]: {userId: adapterUserId}};
      this.adapterUsers[adapterUserId] = {name: adapterUsername,
                                          botId: user.id,
                                          roles: roles || []};
      this.bot.users.botUsers[user.id] = user;
      this.bot.db.write();
      return user;
    }

    return new User(adapterUsername,
                    adapterUserId,
                    {[this.name]: adapterUserId});
  }

}
