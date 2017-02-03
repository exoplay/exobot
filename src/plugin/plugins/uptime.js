import { Plugin, respond, help, permissionGroup } from '../plugin';

const SECONDS = 1000;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;

export default class Uptime extends Plugin {
  static type = 'uptime';
  static propTypes = {};

  constructor() {
    super(...arguments);
    this.start = new Date();
  }

  @help('/uptime shows time since last restart.');
  @permissionGroup('uptime');
  @respond(/^uptime/i);
  pluginUptime() {
    const now = new Date();
    let diff = now - this.start;

    const days = parseInt(diff / DAYS, 10);
    diff -= (days * DAYS);

    const hours = parseInt(diff / HOURS, 10);
    diff -= (hours * HOURS);

    const minutes = parseInt(diff / MINUTES, 10);
    diff -= (minutes * MINUTES);

    const seconds = parseInt(diff / SECONDS, 10);
    diff -= (seconds * SECONDS);

    const message = [];

    if (days) { message.push(`${days} days`); }
    if (hours) { message.push(`${hours} hours`); }
    if (minutes) { message.push(`${minutes} minutes`); }
    if (seconds) { message.push(`${seconds} seconds`); }

    return message.join(',');
  }
}
