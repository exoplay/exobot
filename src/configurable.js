import T from 'proptypes';
import Log from 'log';

const KEY_REGEX = /([a-z][A-Z])/g;

export const PropTypes = T;

// Create a stub log so that updateConfiguration can pass back a map of logs
// instead of logging out - for bot commands like
// /configure <plugin/adapter id> key value
export class StubLog {
  logs = {};

  constructor () {
    Object.keys(Log).forEach(key => {
      this[key.toLowerCase()] = msg => this.logs[key.toLowerCase()] = msg;
    });
  }
}

export class Configurable {
  static propTypes = undefined;
  static defaultProps = {};

  static parseConfig (options={}, log) {
    if (!this.propTypes) { return options; }

    const optionKeys = Object.keys(options);

    return {
      ...this.defaultProps,
      ...(
          Object.keys(this.propTypes || {})
            .filter(k => !optionKeys.includes(k))
            .reduce((c, k) => {
              // loop through any keys not passed in as properties
              const env = this.processEnv(k, this.propTypes[k]);
              if (env) { c[k] = env; }

              return c;
            }, {})
        ),
      ...options,
    };
  }

  static processEnv (key, propType) {
    //process.env[this.envify(k)
    let val = process.env[this.envify(key)];

    if (!val) { return val; }
    if (!propType) { return val; }

    // Convert booleans and numbers, possibly from env vars, to the proper type
    switch (propType) {
      case T.bool:
      case T.bool.isRequired:
        val = this.parseBoolean(val);
        break;
      case T.number:
      case T.number.isRequired:
        val = parseInt(val, 10);
        break;
      case T.string:
      case T.string.isRequired:
        return val;
      default: 
        // it isn't a string, number, or bool. could be anything, even T.any.
        // We'll try to parseit out as JSON, or else return whatever the value
        // is.
        try {
          val = JSON.parse(val);
        } catch (e) {
          return val;
        }
    }
  }

  static validateConfig (config={}, log) {
    return Object.keys(config).reduce((validatedConfig, k) => {
      if (!this.propTypes[k]) {
        log.warning(`Unrecognized prop ${k} passed into options of ${this._name} plugin`);
        validatedConfig[k] = config[k];
        return validatedConfig;
      }

      const err = this.propTypes[k](config, k, `${this._name} config`, 'property');

      if (err) {
        log.warning(err.toString());
        return validatedConfig;
      }

      validatedConfig[k] = config[k];
      return validatedConfig;
    }, {});
  }

  static parseBoolean (value) {
    if (value === 'false') { return false; }
    if (value === 'true') { return true; }
    if (value === !!value) { return value; }
    return value;
  }

  // turn a key like myKey into PLUGINNAME_MY_KEY
  static envify (key='') {
    return [
      this._name,
      key.replace(KEY_REGEX, l => l.split('').join('_')),
    ].join('_').toUpperCase();
  }

  constructor (options, bot, log=bot.log) {
    this.bot = bot;
    this.log = log;

    this.options = this.constructor.parseConfig(options, log);

    if (this.constructor.propTypes && Object.keys(this.constructor.propTypes).length) {
      this.options = this.constructor.validateConfig(this.options, log);
    }
  }

  updateConfiguration (options={}, passThroughErrors) {
    const merged = this.constructor.parseConfig({ ...this.options, ...options });
    const log = passThroughErrors ? new StubLog() : this.log;

    if (this.constructor.propTypes && Object.keys(this.constructor.propTypes).length) {
      this.options = this.constructor.validateConfig(merged, log);
    } else {
      this.options = merged;
    }
  }
}
