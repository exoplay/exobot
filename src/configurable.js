import T from 'proptypes';
import Log from 'log';

const KEY_REGEX = /([a-z][A-Z])/g;

export const PropTypes = T;

// Create a stub log so that updateConfiguration can pass back a map of logs
// instead of logging out - for bot commands like
// /configure <plugin/adapter id> key value
export class StubLog {
  logs = {};

  constructor() {
    Object.keys(Log).forEach((key) => {
      this[key.toLowerCase()] = (msg) => {
        this.logs[key.toLowerCase()] = msg;
      };
    });
  }
}

export class Configurable {
  static propTypes = undefined;
  static defaultProps = {};
  static type = 'Configurable';

  static parseConfig(name = this.type, options = {}) {
    if (!this.propTypes) { return options; }
    const optionKeys = Object.keys(options);

    /* eslint no-param-reassign: 0 */
    return {
      ...this.defaultProps,
      ...(
          Object.keys(this.propTypes || {})
            .filter(k => !optionKeys.includes(k))
            .reduce((c, k) => {
              // loop through any keys not passed in as properties
              const env = this.processEnv(name, k, this.propTypes[k]);
              if (env) { c[k] = env; }

              return c;
            }, {})
        ),
      name,
      ...options,
    };
  }

  static processEnv(name, key, propType) {
    const val = process.env[this.envify(name, key)];

    if (!val) { return; }
    if (!propType) { return val; }

    // Convert booleans and numbers, possibly from env vars, to the proper type
    switch (propType) {
      case T.bool:
      case T.bool.isRequired:
        return this.parseBoolean(val);
      case T.number:
      case T.number.isRequired:
        return parseInt(val, 10);
      case T.string:
      case T.string.isRequired:
        return val;
      default:
        // it isn't a string, number, or bool. could be anything, even T.any.
        // We'll try to parseit out as JSON, or else return whatever the value
        // is.
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
    }
  }

  static validateConfig(name, config = {}, log) {
    const c = Object.keys(this.propTypes).reduce((validatedConfig, k) => {
      const err = this.propTypes[k](config, k, `${name} config`, 'prop');

      if (err) {
        log.warning(err.toString());
        return validatedConfig;
      }

      validatedConfig[k] = config[k];
      return validatedConfig;
    }, {});

    c.name = name;
    return c;
  }

  static parseBoolean(value) {
    if (value === 'false') { return false; }
    if (value === 'true') { return true; }
    if (value === !!value) { return value; }
    return value;
  }

  // turn a key like myKey into PLUGINNAME_MY_KEY
  static envify(name, key = '') {
    return [
      name,
      key.replace(KEY_REGEX, l => l.split('').join('_')),
    ].join('_').toUpperCase();
  }

  get name() {
    if (this.options && this.options.name) {
      return this.options.name;
    }

    return this.constructor.type;
  }

  options = {};

  constructor(options, bot, log = bot.log) {
    this.bot = bot;
    this.log = log;

    this.originalOptions = { ...this.options };
    this.options = this.constructor.parseConfig(options.name, options, log);

    if (this.constructor.propTypes && Object.keys(this.constructor.propTypes).length) {
      this.options = this.constructor.validateConfig(this.name, this.options, log);
    }
  }

  updateConfiguration(options = {}, passThroughErrors = false, overwrite = false) {
    let merged;

    if (overwrite) {
      merged = { ...options };
    } else {
      merged = this.constructor.parseConfig(this.name, { ...this.options, ...options });
    }

    const log = passThroughErrors ? new StubLog() : this.log;

    if (this.constructor.propTypes && Object.keys(this.constructor.propTypes).length) {
      this.options = this.constructor.validateConfig(this.name, merged, log);
    } else {
      this.options = merged;
    }

    this.onConfigChange(options, this.options);
  }

  // this no-op provides a hook for adapters and plugins to re-initialize
  // themselves on config changes.
  onConfigChange() {
  }
}
