import T from 'proptypes';

const KEY_REGEX = /([a-z][A-Z])/g;

export const PropTypes = T;

export class Configurable {
  propTypes = undefined;
  defaultProps = {};

  constructor (options) {
    this.options = options;
  }

  configure (options={}, log) {
    this.options = this.parseConfig(options, this.propTypes);

    if (this.propTypes && Object.keys(this.propTypes).length) {
      this.options = this.validateConfig(this.options, this.propTypes, log);
    }
  }

  parseConfig (options={}, propTypes={}) {
    if (!this.propTypes) { return options; }

    const optionKeys = Object.keys(options);

    const config = {
      ...this.defaultProps,
      ...(
          Object.keys(this.propTypes || {})
            .filter(k => !optionKeys.includes(k))
            .reduce((c, k) => {
              // loop through any keys not passed in as properties
              const env = this.processEnv(k, propTypes[k]);
              if (env) { c[k] = env; }

              return c;
            }, {}),
        ),
      ...options,
    };

    return config;
  }

  processEnv (key, propType) {
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

  validateConfig (config={}, propTypes={}, log) {
    return Object.keys(config).reduce((validatedConfig, k) => {
      if (!propTypes[k]) {
        log.warning(`Unrecognized prop ${k} passed into options of ${this.name} plugin`);
        validatedConfig[k] = config[k];
        return validatedConfig;
      }


      const err = propTypes[k](config, k, `${this.name} config`, 'property');

      if (err) {
        log.warning(err.toString());
        return validatedConfig;
      }

      validatedConfig[k] = config[k];
      return validatedConfig;
    }, {});
  }

  parseBoolean (value) {
    if (value === 'false') { return false; }
    if (value === 'true') { return true; }
    if (value === !!value) { return value; }
    return value;
  }

  // turn a key like myKey into PLUGINNAME_MY_KEY
  envify (key='') {
    return [
      this.name,
      key.replace(KEY_REGEX, l => l.split('').join('_')),
    ].join('_').toUpperCase();
  }
}
