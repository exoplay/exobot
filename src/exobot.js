import 'babel-polyfill';

import Emitter from 'eventemitter3';
import Log from 'log';

const EMITTER_FUNCTIONS = [
  'on',
  'once',
  'emit',
  'removeListener',
  'listeners',
];

export class Exobot {
  plugins = [];
  adapters = {};

  constructor (name, options={}) {
    this.name = name;
    this.alias = options.alias;
    this.emitter = new Emitter();
    this.log = new Log(options.logLevel || Log.WARNING);

    EMITTER_FUNCTIONS.forEach(f => {
      this[f] = this.emitter[f];
    });

    if (options.adapters) {
      options.adapters.forEach(a => this.addAdapter(a));
    }

    if (options.plugins) {
      options.plugins.forEach(p => this.addPlugin(p));
    }
  }

  addPlugin (plugin) {
    plugin.register(this);
    this.plugins.push(plugin);
  }

  addAdapter(adapter) {
    adapter.register(this);
    this.adapters[adapter.id] = adapter;
  }
}

export * from './adapters';
export * from './messages';
export * from './plugins';
export { default as User } from './user';
