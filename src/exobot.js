import 'babel-polyfill';

import Emitter from 'eventemitter3';
import Log from 'log';
import superagent from 'superagent';
import sapp from 'superagent-promise-plugin';
sapp.Promise = Promise;

const http = sapp.patch(superagent);


import { DB } from './db';

export class Exobot {
  plugins = [];
  adapters = {};

  constructor (name, options={}) {
    this.name = name;
    this.alias = options.alias;
    this.emitter = new Emitter();
    this.http = http;

    this.initLog(options.logLevel || Log.WARNING);
    this.initAdapters(options.adapters);
    this.initPlugins(options.plugins);

    const dbPath = options.dbPath || `./data/${name}.json`;
    this.initDB(options.key, dbPath, options.readFile, options.writeFile);
  }

  initAdapters = (adapters=[]) => {
    adapters.forEach(a => this.addAdapter(a));
  }

  initPlugins = (plugins=[]) => {
    plugins.forEach(p => this.addPlugin(p));
  }

  initLog = (logLevel) => {
    const log = new Log(logLevel || Log.WARNING);
    this.log = log;
    this.logLevel = logLevel;

    if (logLevel === Log.DEBUG) {
      setInterval(this.logProcess, 10000);
    }
  }

  initDB = (key, dbPath, readFile, writeFile) => {
    if (!key) {
      this.log.critical('Pass options.key in to bot initializer. Database not initializing.');
      return;
    }

    DB({
      key,
      readFile,
      writeFile,
      path: dbPath,
      emitter: this.emitter,
    }).then((db) => {
      this.db = db;
      this.emitter.emit('dbLoaded', db);
    }, this.log.critical);
  }

  logProcess = () => {
    this.log.debug(process.memoryUsage(), process.cpuUsage());
  }

  addPlugin (plugin) {
    plugin.register(this);
    this.plugins.push(plugin);
  }

  addAdapter (adapter) {
    adapter.register(this);
    this.adapters[adapter.id] = adapter;
  }

  prependNameForWhisper (text) {
    if (
      text.slice(0, this.name.length).toLowerCase() !== this.name.toLowerCase() &&
      text.slice(0, this.alias.length).toLowerCase() !== this.alias.toLowerCase()
    ) {
      text = `${this.name} ${text}`;
    }

    return text;
  }
}

export * from './adapters';
export * from './messages';
export * from './plugins';
export { default as User } from './user';
