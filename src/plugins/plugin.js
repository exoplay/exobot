import { Configurable } from '../configurable';

export class Plugin extends Configurable {
  static propTypes = null;
  static defaultProps = {};

  get listeners () {
    return this.constructor.listenFunctions || [];
  }

  get responders () {
    return this.constructor.respondFunctions || [];
  }

  permissionGroup(fnName) {
    return `${this.name}.${this[fnName].permissionGroup}`;
  }

  constructor (options, bot) {
    super(...arguments);

    if (!this.name) {
      throw new Error('This plugin has a missing `type` and/or options.name  property.');
    }

    this.database();

    bot.registerListeners(this.listeners, this);
    bot.registerResponders(this.responders, this);
  }

  checkPermissions (userId, commandPermissionGroup) {
    return this.bot.checkPermissions(userId, commandPermissionGroup);
  }

  checkPermissionsByToken (token, commandPermissionGroup) {
    return this.bot.checkPermissionsByToken(token, commandPermissionGroup);
  }

  validateMessage (regex) {
    return message => regex.exec(message.text);
  }

  database () {
    if (this.defaultDatabase) {
      Object.keys(this.defaultDatabase).forEach(name => {
        const val = this.bot.db.get(name).value();

        if (typeof val === 'undefined') {
          this.bot.db.set(name, this.defaultDatabase[name]).value();
        }
      });
    }
  }

  helpText () {
    return this.constructor.help.map(n =>
      `[${this.permissionGroup(n)}] ${this[n].help}`
    );
  }
}

export const listen = (command) => (target, name, descriptor) => {
  const fn = descriptor.value;

  if (!fn.permissionGroup) {
    fn.permissionGoup = name;
  }

  if (!target.constructor.listenFunctions) {
    target.constructor.listenFunctions = [];
  }

  target.constructor.listenFunctions.push([command, name]);
};

export const respond = (command) => (target, name, descriptor) => {
  const fn = descriptor.value;

  if (!fn.permissionGroup) {
    fn.permissionGoup = name;
  }

  if (!target.constructor.respondFunctions) {
    target.constructor.respondFunctions = [];
  }

  target.constructor.respondFunctions.push([command, name]);
};

export const help = (text) => (target, fnName, descriptor) => {
  descriptor.value.help = text;

  if (!target.constructor.help) {
    target.constructor.help = [];
  }

  target.constructor.help.push(fnName);
};

export const permissionGroup = (group) => (target, fnName, descriptor) => {
  descriptor.value.permissionGroup = group;
};
