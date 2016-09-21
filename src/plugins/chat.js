import Plugin from './plugin';
import TextMessage from '../messages/text';

const DEFAULT_REGEXP = /.+/;

export class ChatPlugin extends Plugin {
  regexp = DEFAULT_REGEXP;

  respondFunctions = [];
  listenFunctions = [];
  help = [];

  constructor () {
    super(...arguments);
  }

  helpText () {
    return this.help.map(n => `[${this[n].permissionGroup}] ${this[n].help}`);
  }

  register (bot) {
    super.register(bot);
    this.bot = bot;

    if (this.postConstructor) {
      this.postConstructor.forEach(([fn, args]) => fn.call(this, ...args));
    }

    bot.emitter.on('receive-message', m => {
      // v = [
      //   validation function or regex,
      //   the response function from the plugin,
      //   the name of the function (the class.property name)
      // ];
      // as pushed by the listen/respond functions below

      let skipFns = [];

      if (m.respond) {
        this.respondFunctions.forEach(v => this.process(...v, m));
        skipFns = this.respondFunctions.map(([,,name]) => name);
      }

      this.listenFunctions
            .filter(([,,name]) => !skipFns.includes(name))
            .forEach(v => this.process(...v, m));
    });
  }

  async process (validation, response, fnName, message) {
    try {
      const fn = validation.exec ? this.validateMessage(validation) : validation;
      const res = fn(message, this.bot);

      if (res) {
        if (await this.checkPermissions(message.user.id, this[fnName].permissionGroup)) {
          const text = response.call(this, res, message);
          if (!text) { return; }

          if (text instanceof Promise) {
            const t = await text;
            const newMessage = new TextMessage({ ...message, text: t });
            return this.bot.send(newMessage);
          }

          const newMessage = new TextMessage({ ...message, text });
          this.bot.send(newMessage);
        }
      }
    } catch (e) {
      this.bot.log.warning(e);
    }
  }

  async checkPermissions (userId, commandPermissionGroup) {
    return this.bot.checkPermissions(userId, commandPermissionGroup);
  }

  respond (validation, fn, name) {
    this.respondFunctions.push([validation, fn, name]);
  }

  listen (validation, fn, name) {
    this.listenFunctions.push([validation, fn, name]);
  }

  setHelp (text, fnName) {
    this.help.push(fnName);
    this[fnName].help = text;
  }

  setPermissionGroup (fn, name) {
    this[fn].permissionGroup = `${this.name}.${name}`;
  }

  validateMessage (regex) {
    return message => regex.exec(message.text);
  }
}

export const listen = (validation) => (target, name, descriptor) => {
  const fn = descriptor.value;

  if (!fn.permissionGroup) {
    fn.permissionGoup = `${target.name}.${name}`;
  }

  target.postConstructor = target.postConstructor || [];
  target.postConstructor.push(
    [target.listen, [validation, fn, name]]
  );
};

export const respond = (validation) => (target, name, descriptor) => {
  const fn = descriptor.value;

  if (!fn.permissionGroup) {
    fn.permissionGoup = `${target.name}.${name}`;
  }

  target.postConstructor = target.postConstructor || [];
  target.postConstructor.push(
    [target.respond, [validation, fn, name]]
  );
};

export const help = (text) => (target, fnName) => {
  target.postConstructor.push(
    [target.setHelp, [text, fnName]]
  );
};

export const permissionGroup = (name) => (target, fnName) => {
  target.postConstructor.push([target.setPermissionGroup, [fnName, name] ]);
};
