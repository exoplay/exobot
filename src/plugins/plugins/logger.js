import EventPlugin from '../event';

export default class LoggerPlugin extends EventPlugin {
  static levels = {
    DEBUG: 3,
    WARNING: 2,
    ERROR: 1,
    FATAL: 0,
  };
}
