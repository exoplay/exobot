import { Plugin, respond, help, permissionGroup, get } from '../plugin';

const start = new Date();

const SECONDS = 1000;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24

export class Uptime extends Plugin {
  static _name = 'uptime';
  static propTypes = {};

  @help('/uptime shows time since last restart.');
  @permissionGroup('uptime');
  @respond(/^uptime/i);
  @get('/uptime');
  pluginUptime () {
    const now = new Date();
    let diff = now - start;

    const days = parseInt(diff / DAYS, 10);
    diff = diff - (days * DAYS);

    const hours = parseInt(diff / HOURS, 10);
    diff = diff - (hours * HOURS);

    const minutes = parseInt(diff / MINUTES, 10);
    diff = diff - (minutes * MINUTES);

    const seconds = parseInt(diff / SECONDS, 10);
    diff = diff - (seconds * SECONDS);

    const message = [];

    if (days) { message.push(`${days} days`) ; }
    if (hours) { message.push(`${hours} hours`) ; }
    if (minutes) { message.push(`${minutes} minutes`) ; }
    if (seconds) { message.push(`${seconds} seconds`) ; }

    return message.join(',');
  }
}
