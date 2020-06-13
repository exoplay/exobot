import { Configurable } from '../configurable';
import PresenceMessage from '../messages/presence';
import User from '../user';

export const AdapterOperationTypes = {
  DISCIPLINE_USER_WARNING: 'AdapterOperationTypes_discipline_user_warning',
  DISCIPLINE_USER_TEMPORARY: 'AdapterOperationTypes_discipline_user_temporary',
  DISCIPLINE_USER_PERMANENT: 'AdapterOperationTypes_discipline_user_permanent',
  WHISPER_USER: 'AdapterOperationTypes_whisper_user',
  PROMPT_USER: 'AdapterOperationTypes_prompt_user',
};

export default class Adapter extends Configurable {
  static STATUS = {
    UNINITIALIZED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    DISCONNECTED: 3,
    RECONNECTING: 4,
    ERROR: 5,
  }

  get roleMapping() {
    return this.options.roleMapping;
  }

  status = Adapter.STATUS.UNINITIALIZED;

  constructor(options, bot) {
    super(options, bot);

    if (!bot) { throw new Error('No bot passed to register; fatal.'); }

    if (!this.name) {
      throw new Error('This adapter has no `name` property; some plugins will not work.');
    }

    this.bot = bot;
    this.initUsers();
    this.prompts = {};
    this.bot.emitter.on(AdapterOperationTypes.PROMPT_USER, this.promptUser);
    this.status = Adapter.STATUS.CONNECTING;
  }

  /* eslint no-empty-function: 0 */
  async shutdown() { }

  receive({
 user, text, channel, whisper,
}) {
    if (!text) {
      this.bot.log.info('Message received with undefined text.');
      return;
    }

    const message = this.bot.parseMessage({
      user,
      text,
      channel,
      whisper,
      adapter: this.name,
    });

    this.bot.receiveMessage(message);
  }

  receiveWhisper({ user, text, channel }) {
    if (!text) {
      this.bot.log.warning('Message received with undefined text.');
      return;
    }
    if (this.prompts[user.id]) {
      this.prompts[user.id].forEach((val, index) => {
        if (val.cb(val.data, {
 user, text, channel, adapter: this.name,
})) {
          delete this.prompts[user.id][index];
        }
      });
    }

    this.receive({
 user, text, channel, whisper: true,
});
  }

  enter({ user, channel }) {
    const message = new PresenceMessage({
      user,
      channel,
      adapter: this.name,
      type: PresenceMessage.TYPES.ENTER,
    });

    this.bot.emitter.emit('enter', message);
  }

  leave({ user, channel }) {
    const message = new PresenceMessage({
      user,
      channel,
      adapter: this.name,
      type: PresenceMessage.TYPES.LEAVE,
    });

    this.bot.emitter.emit('leave', message);
  }

  /* eslint class-methods-use-this: 0, no-console: 0 */
  send(message) {
    console.log(message.text);
  }

  ping() {
    this.pong();
  }

  pong() {
    this.bot.log.warning('Ping received, this.pong() not implemented.');
  }

  getUserIdByUserName(name) {
    this.bot.log.warning('getUserIdByUserName not implemented by this adapter.');
    return name;
  }

  getAdapterUserIdById(userId) {
    const botUser = this.bot.getUser(userId);
    if (botUser) {
      if (botUser.adapters && botUser.adapters[this.name]) {
        return botUser.adapters[this.name].userId;
      }
    }
  }

  getRoleIdByRoleName(name) {
    this.bot.log.warning('getRoleIdByRoleName not implemented by this adapter');
    return name;
  }

  /* eslint class-methods-use-this: 0 */
  getRolesForUser() {
    return [];
  }

  async initUsers() {
    this.adapterUsers = this.bot.getAdapterUserDb(this.name);
  }

  getRoles() {
    this.bot.log.warning('getRoles not implemented by this adapter');
    return false;
  }

  async getUser(adapterUserId, adapterUsername, adapterUser = {}) {
    if (!adapterUserId) {
      this.bot.log.error(`Adapter ${this.name} called getUser without adapterUserId`);
    }

    if (!adapterUsername) {
      this.bot.log.warning(`Adapter ${this.name} called getUser without adapterUsername`);
    }

    const roles = this.getRoles(adapterUserId, adapterUser);

    if (this.adapterUsers) {
      if (this.adapterUsers[adapterUserId]) {
        if (roles) {
          this.adapterUsers[adapterUserId].roles = roles;
        }

        if (adapterUsername) {
          this.bot.setUserData(this.adapterUsers[adapterUserId].botId, 'name', adapterUsername);
        }

        return this.bot.getUser(this.adapterUsers[adapterUserId].botId);
      }

      const user = new User(adapterUsername);

      user.adapters = { [this.name]: { userId: adapterUserId } };

      this.adapterUsers[adapterUserId] = {
        name: adapterUsername,
        botId: user.id,
        roles: roles || [],
      };

      this.bot.addUser(user);
      return user;
    }

    return new User(
      adapterUsername,
      adapterUserId,
      { [this.name]: adapterUserId },
    );
  }

  promptUser = (adapterName, data, cb) => {
    if (this.name === adapterName) {
      this.bot.emitter.emit(AdapterOperationTypes.WHISPER_USER, this.name, data);
      if (this.prompts[data.userId]) {
        this.prompts[data.userId].push({ data, cb });
      } else {
        this.prompts[data.userId] = [{ data, cb }];
      }
    }
  }
}
