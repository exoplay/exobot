import { Configurable } from '../configurable';
import TextMessage from '../messages/text';

export class Plugin extends Configurable {
  static propTypes = null;
  static defaultProps = {};

  respondFunctions = [];
  listenFunctions = [];
  httpFunctions = [];

  help = [];

  constructor (options, bot) {
    super(options, bot);

    if (!this.constructor._name) {
      throw new Error('This plugin has a missing `name` property.');
    }

    if (this.postConstructor) {
      this.postConstructor.forEach(([fn, args]) => fn.call(this, ...args));
    }

    this.database();

    bot.emitter.on('receive-message', this.receiveMessage);
  }

  receiveMessage = (message) => {
    // v = [
    //   validation function or regex,
    //   the response function from the plugin,
    //   the name of the function (the class.property name)
    // ];
    // as pushed by the listen/respond functions below

    let skipFns = [];

    if (message.respond) {
      this.respondFunctions.forEach(v => this.process(...v, message));
      skipFns = this.respondFunctions.map(([,,name]) => name);
    }

    this.listenFunctions
          .filter(([,,name]) => !skipFns.includes(name))
          .forEach(v => this.process(...v, message));
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

  checkPermissions (userId, commandPermissionGroup) {
    return this.bot.checkPermissions(userId, commandPermissionGroup);
  }

  checkPermissionsByToken (token, commandPermissionGroup) {
    return this.bot.checkPermissionsByToken(token, commandPermissionGroup);
  }

  respond (validation, fn, name) {
    this.respondFunctions.push([validation, fn, name]);
  }

  listen (validation, fn, name) {
    this.listenFunctions.push([validation, fn, name]);
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
    return this.help.map(n => `[${this[n].permissionGroup}] ${this[n].help}`);
  }

  setHelp (text, fnName) {
    this.help.push(fnName);
    this[fnName].help = text;
  }

  setPermissionGroup (fn, name) {
    this[fn].permissionGroup = `${this.constructor._name}.${name}`;
  }

  http (method, route, fn, name) {
    this.bot.router[method](route, async (ctx) => {
      const params = {
        ...ctx.params,
        ...ctx.query,
        ...ctx.body,
      };

      if (this.checkPermissionsByToken(params.token, this[name].permissionGroup)) {
        return ctx.body = await fn(params);
      }

      return ctx.status = 403;
    });
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

export const get = (route) => (target, name, descriptor) => {
  const fn = descriptor.value;
  target.postConstructor = target.postConstructor || [];
  target.postConstructor.push([target.http, ['get', route, fn, name]])
}

export const post = (route) => (target, name, descriptor) => {
  const fn = descriptor.value;
  target.postConstructor = target.postConstructor || [];
  target.postConstructor.push([target.http, ['post', route, fn, name]])
}

export const put = (route) => (target, name, descriptor) => {
  const fn = descriptor.value;
  target.postConstructor = target.postConstructor || [];
  target.postConstructor.push([target.http, ['put', route, fn, name]])
}

export const patch = (route) => (target, name, descriptor) => {
  const fn = descriptor.value;
  target.postConstructor = target.postConstructor || [];
  target.postConstructor.push([target.http, ['patch', route, fn, name]])
}

export const del = (route) => (target, name, descriptor) => {
  const fn = descriptor.value;
  target.postConstructor = target.postConstructor || [];
  target.postConstructor.push([target.http, ['del', route, fn, name]])
}
