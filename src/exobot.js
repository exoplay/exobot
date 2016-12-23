import Emitter from 'eventemitter3';
import Log from 'log';
import superagent from 'superagent';
import sapp from 'superagent-promise-plugin';
import { intersection } from 'lodash/array';
import { get } from 'lodash/object';
import { merge } from 'lodash';

sapp.Promise = Promise;

import Trie from './trie';
import { Permissions } from './plugins/plugins';
import { TextMessage } from './messages';

import { Configurable, PropTypes as T } from './configurable';

import { Adapter } from './adapters';
import { Plugin } from './plugins';
import { DB } from './db';

const http = sapp.patch(superagent);
const USERS_DB = 'exobot-users';
const CONFIG_DB = 'exobot-configuration';

const PLUGIN = 'plugins';
const ADAPTER = 'adapters';

const CLASS_NAME_FOR_CONFIG = 'exobot';

export class Command {
  constructor(command, name, plugin, bot, respond=false) {
    this._name = name;
    this.bot = bot;

    this.command = respond ? `${bot.options.name} ${command}` : command;
    this.command = this.command.toLowerCase(); // make the matcher case-insensitive

    this.plugin = plugin;

    this.run = this.run.bind(this);
  }

  async run (message, params) {
    if (this.bot.checkPermissions(message.user.id, this.plugin.permissionGroup(this._name))) {
      const m = new TextMessage({
        ...message,
        params,
      });

      const text = await this.plugin[this._name](m);

      const responseMessage = new TextMessage({
        ...message,
        params,
        text,
      });

      return responseMessage;
    }
  }
}

export class Exobot extends Configurable {
  static type = CLASS_NAME_FOR_CONFIG;

  static propTypes = {
    name: T.string.isRequired,
    key: T.string.isRequired,
    plugins: T.object.isRequired,
    requirePermissions: T.bool.isRequired,
    logLevel: T.number,
    alias: T.string,
    readFile: T.func,
    writeFile: T.func,
    enableRouter: T.bool,
    httpPrefix: T.string,
  };

  static defaultProps = {
    name: CLASS_NAME_FOR_CONFIG,
    plugins: {},
    logLevel: Log.WARNING,
    requirePermissions: false,
    enableRouter: true,
  }

  plugins = {}
  adapters = {};

  constructor (options={}) {
    const log = new Log(options.logLevel);
    super(options, undefined, log);

    // Update logLevel if it changed during configuration parsing
    if (this.options.logLevel !== options.logLevel) {
      this.log = new Log(this.options.logLevel);
    } else {
      this.log = log;
    }

    process.on('unhandledRejection', this.log.critical.bind(this.log));

    this.configure();
    this.initialize();
  }

  configure () {
    this.botNameRegex =
      new RegExp(`^(?:(?:@?${this.options.name}|${this.options.alias})[,\\s:.-]*)(.+)`, 'i');

    this.emitter = new Emitter();
    this.http = http;
    this.requirePermissions = this.options.requirePermissions;
  }

  async initialize() {
    const dbPath = this.options.dbPath || `./data/${this.options.name}.json`;

    try {
      await this.initDB(this.options.key, dbPath, this.options.readFile, this.options.writeFile);
    } catch (e) {
      this.log.critical(e);
      return;
    }

    try {
      this.initRouter();
      this.initDBConfiguration();
      this.initUsers();
      this.initPlugins(this.options.plugins);
    } catch (e) {
      this.log.critical(e);
    }
  }

  shutdown() {
    Object.keys(this.adapters).forEach(k => {
      this.adapters[k].shutdown();
    });

    Object.keys(this.plugins).forEach(k => {
      this.adapters[k].shutdown();
    });
  }

  initRouter () {
    this.commandRouter = new Trie();
  }

  initDBConfiguration () {
    this.updateConfiguration(this.getConfiguration(this.name));
  }

  initPlugins (plugins={}) {
    const loadedPlugins = Object.keys(plugins).reduce((p, k) => {
      const [,config] = plugins[k];
      let [plugin] = plugins[k];

      if (typeof plugin === 'string') {
        // juke out webpack with evil code. use base node require so that
        // we can autoload plugins.
        /* eslint no-eval: 0 */ // shhhhhhhhh
        const req = eval('require');
        const requiredPlugin = req(plugin);

        if (config.import) {
          plugin = get(requiredPlugin, config.import);
        }
      }

      p[k] = [plugin, config];
      return p;
    }, {});

    Object.keys(loadedPlugins).forEach(k => this.addPlugin(k, ...loadedPlugins[k]));
  }

  async initDB (key, dbPath, readFile, writeFile) {
    if (!key) {
      const err = new Error('Pass options.key in to bot initializer. Database not initializing.');
      return Promise.reject(err);
    }

    return new Promise((resolve, reject) => {
      DB({
        key,
        readFile,
        writeFile,
        path: dbPath,
        emitter: this.emitter,
      }).then((db) => {
        this.db = db;
        this.emitter.emit('dbLoaded', db);
        resolve(db);
      }, (err) => {
        this.log.critical.bind(this.log);
        reject(err);
      });
    });
  }

  initUsers () {
    this.users = this.db.get(USERS_DB).value();

    if (this.users) {
      this.log.debug(Object.keys(this.users.botUsers).length, 'exobot users');
      return;
    }

    this.db.set(USERS_DB, { botUsers: {} }).value();
    this.users = this.db.get(USERS_DB).value();
  }

  mergeUsers = (destUser, srcUser) => {
    if (destUser && srcUser) {
      merge(destUser.roles, srcUser.roles);

      Object.keys(srcUser.adapters).map(adapter => {
        this.users[adapter][srcUser.adapters[adapter].userId].botId = destUser.id;
      });

      merge(destUser.adapters, srcUser.adapters);

      delete this.users.botUsers[srcUser.id];

      this.db.write();
      return 'Login complete';
    }
  }

  addUser (user) {
    this.users.botUsers[user.id] = user;
    this.db.write();
  }

  addRole = (userId, roleName) => {
    this.users.botUsers[userId].roles[roleName] = true;
    this.db.write();
  }

  getRoles = (userId) => {
    return Object.keys(this.users.botUsers[userId].roles);
  }

  removeRole = (userId, roleName) => {
    const roles = this.users.botUsers[userId].roles;
    delete roles[roleName];
    this.db.write();
  }

  getUserRoles = (userId) => {
    const user = this.users.botUsers[userId];
    let roles = [];

    if (user) {
      Object.keys(user.adapters).map(adapter => {
        const adapterRoles = this.adapters[adapter].getRolesForUser(user.adapters[adapter].userId);
        if (adapterRoles) {
          roles = roles.concat(adapterRoles);
        }
      });

      roles = roles.concat(Object.keys(user.roles));
      return roles;
    }
  }

  checkPermissions (userId, commandPermissionGroup) {
    if (!this.usePermissions) { return true; }
    // special group for admin authorization - otherwise you could never auth
    // in the first place when public commands are disabled
    if (commandPermissionGroup === 'permissions.public') { return true; }

    // get user's roles
    const roles = this.getUserRoles(userId);
    // if user has `admin` role, allow it
    if (roles && roles.includes('admin')) { return true; }

    // get roles assigned to the command group
    const groups = this.db.get(`permissions.groups.${commandPermissionGroup}`).value();
    // if there are no groups, and requirePermissions is false, allow it
    // requirePermissions = false == (public by default)
    if (!groups || !Object.keys(groups)) {
      if (!this.requirePermissions) {
        return true;
      }

      // otherwise, if there are no groups, and we're not an admin, return
      // false.
      return false;
    }
    // if command is in `public`, allow it
    if (groups.public) { return true; }

    // check user's list of roles against list of groups that have the command
    // if there's a match (user is in a group with the command), allow it
    if (intersection(roles, Object.keys(groups)).length) {
      return true;
    }

    return false;
  }

  getUserIdByUserName (name) {
    return Object.keys(this.users.botUsers)
                   .find(id => this.users.botUsers[id].name.toLowerCase() === name.toLowerCase());
  }

  addPlugin (name, PluginClass, opts) {
    const options = {
      ...opts,
      name: name,
      ...this.getConfiguration(name),
    };

    let type;

    const plugin = new PluginClass(options, this);

    if (plugin instanceof Permissions) {
      this.usePermissions = true;
    }

    if (plugin instanceof Plugin) { type = PLUGIN; }
    if (plugin instanceof Adapter) { type = ADAPTER; }

    if (!type) {
      return this.log.error(
        `Attempted to initialize "${name}" which is neither a Plugin nor an Adapter.`
      );
    }

    if (this.getPluginByName(name)) {
      this.log.warning(`Multiple plugins with name "${name}" were initialized.`);
    }

    this[type][name] = plugin;
  }

  getConfiguration (pluginName, key) {
    const config = this.db.get(`${CONFIG_DB}.${pluginName}`).value() || {};

    if (key) {
      return config[key];
    }

    return config;
  }

  setConfiguration (pluginName, key, value) {
    let plugin = this.getPluginByName(pluginName);

    if (!plugin) {
      plugin = this.getAdapterByName(pluginName);
    }

    if (plugin) {
      this.db.set(`${CONFIG_DB}.${pluginName}.${key}`, value).value();
      plugin.updateConfiguration({ [key]: value });
    }
  }

  resetConfiguration (pluginName) {
    this.db.set(`${CONFIG_DB}.${pluginName}`, {}).value();
    let plugin = this.getPluginByName(pluginName) || this.getAdapterByName(pluginName);

    if (!pluginName && pluginName === 'exobot') {
      plugin = this;
    }

    if (plugin) {
      plugin.updateConfiguration(plugin.originalOptions, false, true);
    }
  }

  registerListeners (listeners=[], plugin) {
    listeners.forEach(([command, name]) => {
      const c = new Command(command, name, plugin, this);
      this.commandRouter.define(c.command, c.run);

      // also register a responder to make whispers work
      const r = new Command(command, name, plugin, this, true);
      this.commandRouter.define(r.command, r.run);
    });
  }

  registerResponders (responders=[], plugin) {
    responders.forEach(([command, name]) => {
      const c = new Command(command, name, plugin, this, true);
      this.commandRouter.define(c.command, c.run);
    });
  }

  send = message => {
    if (!message.text) { return; }
    const adapter = this.getAdapterByMessage(message);

    if (!adapter) {
      this.log.warning(`Message sent with invalid adapter: ${message.adapter}`);
      return;
    }

    adapter.send(message);
    return message;
  }

  getByName = (name, list) => {
    return list[name];
  }

  getPluginByName = (name) => {
    return this.getByName(name, this.plugins);
  }

  getAdapterByName = name => {
    return this.getByName(name, this.adapters);
  }

  getAdapterByMessage = message => {
    return this.getByName(message.adapter, this.adapters);
  }

  async receiveMessage (message) {
    const node = this.commandRouter.match(message.text.toLowerCase());
    console.log(node, message.text.toLowerCase());

    if (node && node.node) {
      const res = await node.node.fn(message, node.params);

      if (res) {
        return this.send(res);
      }
    }
  }

  parseMessage = message => {
    const { text } = message;
    const exec = this.botNameRegex.exec(text);

    // prepend the bot name to the command if it's a whisper and it isn't
    // included
    if (message.whisper) {
      if (exec) {
        return new TextMessage({ ...message, text: exec[1] });
      }

      return new TextMessage({ ...message, text: `${this.options.name} text` });
    }

    return new TextMessage(message);
  }
}

export * from './adapters';
export * from './messages';
export * from './plugins';
export * from './db';
export { default as User } from './user';
export { default as Trie } from './trie';
export const LogLevels = Log;
