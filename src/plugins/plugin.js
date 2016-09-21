const KEY_REGEX = /([a-z][A-Z])/g;

export default class Plugin {
  help = undefined;
  _requiresDatabase = false;
  propTypes = null;
  defaultProps = {};

  constructor (options={}) {
    this.options = options;
  }

  register (bot) {
    this.bot = bot;

    this.options = this.parseConfig({ ...this.defaultProps, ...this.options });

    if (this.propTypes && Object.keys(this.propTypes).length) {
      this.checkConfig(this.options, this.propTypes, bot);
    }

    if (!bot) { throw new Error('No bot passed to register; fatal.'); }

    if (!this.name) {
      throw new Error('This plugin has a missing `name` property.');
    }

    if (!this.propTypes) {
      bot.log.notice(`Plugin "${this.name}" does not define propTypes; it should.`);
    }

    this.database();
  }

  listen () {
    if (!this.bot) {
      throw new Error('No bot to listen on; fatal.');
    }
  }

  parseConfig (options={}) {
    const optionKeys = Object.keys(options);

    const config = {
      ...options,
      ...(
          Object.keys(this.propTypes || {})
            .filter(k => !optionKeys.includes(k))
            .reduce((c, k) => {
              const env = process.env[this.envify(k)];

              if (env) {
                c[k] = env;
              }

              return c;
            }, {})
      ),
    };

    return config;
  }

  checkConfig (config={}, propTypes={}, bot) {
    return Object.keys(propTypes).reduce((pass, k) => {
      if (!propTypes[k]) {
        bot.log.warning(`Unrecognized prop ${k} passed into options of ${this.name} plugin`);
        return false;
      }

      const err = propTypes[k](config, k, `${this.name} config`, 'property');

      if (err) {
        bot.log.warning(err.toString());
        return false;
      }

      return pass;
    }, true);
  }

  // turn a key like myKey into PLUGINNAME_MY_KEY
  envify (key='') {
    return [
      this.name,
      key.replace(KEY_REGEX, l => l.split('').join('_')),
    ].join('_').toUpperCase();
  }

  async database () {
    if (this.defaultDatabase) {
      await this.databaseInitialized();

      Object.keys(this.defaultDatabase).forEach(name => {
        const val = this.bot.db.get(name).value();

        if (typeof val === 'undefined') {
          this.bot.db.set(name, this.defaultDatabase[name]).value();
        }
      });
    }
  }

  async databaseInitialized () {
    this._requiresDatabase = true;

    if (this._requiresDatabase && this.bot.db) {
      return true;
    }

    return new Promise((resolve) => {
      this.bot.emitter.on('dbLoaded', resolve);
    });
  }
}
