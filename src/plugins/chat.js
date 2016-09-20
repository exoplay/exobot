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
    this.botNameRegex = new RegExp(`^(?:(?:@?${bot.name}|${bot.alias})[,\\s:.-]*)(.+)`, 'i');

    if (this.postConstructor) {
      this.postConstructor.forEach(([fn, args]) => fn.bind(this)(...args));
    }

    bot.emitter.on('receive-message', message => {
      // v = [
      //   validation function or regex,
      //   the response function from the plugin,
      //   the name of the function (the class.property name)
      // ];
      // as pushed by the listen/respond functions below
      this.respondFunctions.forEach(v => this.process(...v, message, true));
      this.listenFunctions.forEach(v => this.process(...v, message));
    });
  }

  async process (validation, response, fnName, message, isResponder=false) {
    try {
      if (isResponder) {
        const text = this.validateBotName(message);
        if (!text) { return; }

        message = new TextMessage({ ...message, text, direct: true });
      } else if (message.whisper) {

        // if it's a listener on a whisper, remove the botname first so it still
        // works
        const text = this.validateBotName(message);
        if (!text) { return; }

        message = new TextMessage({ ...message, text, direct: true });
      } else {
        const text = message.text;
        if (!text) { return; }

        message = new TextMessage({ ...message, text, direct: true });
      }

      if (validation.exec) { validation = this.validate(validation); }

      const res = validation(message);

      if (res) {
        if (await this.checkPermissions(message.user.id, this[fnName].permissionGroup)) {
          const text = response.bind(this)(res, message);
          if (!text) { return; }

          if (text instanceof Promise) {
            text.then(t => {
              const newMessage = new TextMessage({ ...message, text: t });
              this.bot.send(newMessage);
            });
          } else {
            const newMessage = new TextMessage({ ...message, text });
            this.bot.send(newMessage);
          }
        }
      }
    } catch (e) {
      this.bot.log.warning(e);
    }
  }

  async checkPermissions (userId, commandPermissionGroup) {
    return this.bot.checkPermissions(userId, commandPermissionGroup);
  }

  validate (regex) {
    return message => regex.exec(message.text);
  }

  validateBotName (message) {
    const exec = this.botNameRegex.exec(message.text);
    if (!exec) { return; }

    return exec[1];
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
