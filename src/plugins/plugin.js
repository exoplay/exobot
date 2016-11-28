import { Configurable } from '../configurable';
import { TextMessage } from '../messages';

export class Plugin extends Configurable {
  static propTypes = null;
  static defaultProps = {};

  get listeners() {
    return this.constructor.listenFunctions || [];
  }

  get responders() {
    return this.constructor.respondFunctions || [];
  }

  permissionGroup(fnName) {
    return `${this.name}.${this[fnName].permissionGroup}`;
  }

  constructor() {
    super(...arguments);

    if (!this.name) {
      throw new Error('This plugin has a missing `type` and/or options.name  property.');
    }

    this.database();
  }

  receiveMessage(message) {
    // v = [
    //   validation function or regex,
    //   the response function from the plugin,
    //   the name of the function (the class.property name)
    // ];
    // as pushed by the listen/respond functions below

    let skipFns = [];
    let res = [];

    if (message.respond) {
      res = res.concat(
        this.responders
          .map(v => this.process(...v, message))
          .filter(r => r));

      skipFns = this.responders.map(([, , name]) => name);
    }

    res = res.concat(
      this.listeners
        .filter(([, , name]) => !skipFns.includes(name))
        .map(v => this.process(...v, message))
        .filter(r => r));

    return res;
  }

  async process(validation, fnName, message) {
    try {
      const fn = validation.exec ? this.validateMessage(validation) : validation;
      const res = fn(message, this.bot);

      if (res) {
        if (await this.checkPermissions(message.user.id, fnName)) {
          const text = this[fnName](res, message);
          if (!text) { return; }

          if (text instanceof Promise) {
            const t = await text;
            const newMessage = new TextMessage({ ...message, text: t });
            this.bot.send(newMessage);
            return newMessage;
          }

          const newMessage = new TextMessage({ ...message, text });
          this.bot.send(newMessage);
          return newMessage;
        }
      }
    } catch (e) {
      this.bot.log.warning(e);
    }
  }

  checkPermissions(userId, commandPermissionGroup) {
    return this.bot.checkPermissions(userId, this.permissionGroup(commandPermissionGroup));
  }

  checkPermissionsByToken(token, commandPermissionGroup) {
    return this.bot.checkPermissionsByToken(token, this.permissionGroup(commandPermissionGroup));
  }

  validateMessage(regex) {
    return message => regex.exec(message.text);
  }

  database() {
    if (this.defaultDatabase) {
      Object.keys(this.defaultDatabase).forEach((name) => {
        const val = this.bot.db.get(name).value();

        if (typeof val === 'undefined') {
          this.bot.db.set(name, this.defaultDatabase[name]).value();
        }
      });
    }
  }

  helpText() {
    return this.constructor.help.map(n =>
      `[${this.permissionGroup(n)}] ${this[n].help}`,
    );
  }
}

/* eslint no-param-reassign: 0 */
export const listen = command => (target, name, descriptor) => {
  const fn = descriptor.value;

  if (!fn.permissionGroup) {
    fn.permissionGoup = name;
  }

  if (!target.constructor.listenFunctions) {
    target.constructor.listenFunctions = [];
  }

  target.constructor.listenFunctions.push([command, name]);
};

export const respond = command => (target, name, descriptor) => {
  const fn = descriptor.value;

  if (!fn.permissionGroup) {
    fn.permissionGoup = name;
  }

  if (!target.constructor.respondFunctions) {
    target.constructor.respondFunctions = [];
  }

  target.constructor.respondFunctions.push([command, name]);
};

export const help = text => (target, fnName, descriptor) => {
  descriptor.value.help = text;

  if (!target.constructor.help) {
    target.constructor.help = [];
  }

  target.constructor.help.push(fnName);
};

export const permissionGroup = group => (target, fnName, descriptor) => {
  descriptor.value.permissionGroup = group;
};
