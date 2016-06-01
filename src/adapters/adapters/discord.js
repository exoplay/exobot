import Adapter from '../adapter';
import User from '../../user';

import Discord from 'discord.io';

export const EVENTS = [
  'ready',
  'message',
  'presence',
  'disconnected',
];

export default class DiscordAdapter extends Adapter {
  channels = {}

  constructor ({ token, botId, username }) {
    super(...arguments);

    this.botId = botId;
    this.username = username;
    this.token = token;
  }

  register (bot) {
    super.register(...arguments);

    const { token, botId, username } = this;

    if (!token || !botId || !username) {
      bot.log.critical('token, botId, and username are required to connect to discord.');
      return;
    }

    this.client = new Discord.Client({
      token,
      autorun: true,
    });

    EVENTS.forEach(e => {
      this.client.on(e, (...args) => this[e](...args));
      this.client.on(e, (...args) => this.bot.emit(`discord-${e}`, ...args));
    });
  }

  respond (message) {
    this.bot.log.info(`Sending ${message.text} to ${message.channel}`);

    this.client.sendMessage({
      to: message.channel,
      message: message.text,
    });
  }

  ready () {
    this.state = 'connected';

    this.bot.emit('connected', 'id', this.id);
    this.bot.log.info('Connected to Discord.');

    this.client.setPresence({
      game: 'Exobotting',
    });
  }

  disconnected = () => {
    this.bot.log.critical('Disconnected from Discord.');
  }

  message (username, userId, channel, text, rawEvent) {
    if (username !== this.username) {
      if (this.client.directMessages[channel]) {
        return this.whisper(username, userId, channel, text, rawEvent);
      }

      const user = new User(username, userId);
      this.receive({ user, text, channel });
    }
  }

  presence (username, userId, status, gameName, rawEvent) {
    if (userId !== this.botId) {
      const user = new User(username, userId);

      if (status === 'online') {
        return super.enter({ user, channel: rawEvent.d.channel_id });
      } else if (status === 'offline') {
        return super.leave({ user, channel: rawEvent.d.channel_id });
      }
    }
  }

  whisper (username, userId, channel, text) {
    this.bot.log.info(`Received whisper from ${username}: ${text}`);

    if (username !== this.username) {
      const user = new User(username, userId);

      const botname = this.bot.name;

      if (text.slice(0, botname.length).toLowerCase() !== botname.toLowerCase()) {
        text = `${this.bot.name} ${text}`;
      }

      super.receive({ user, text, channel});
    }
  }
}
