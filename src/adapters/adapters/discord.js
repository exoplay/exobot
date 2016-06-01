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

  send (message) {
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

  message (username, userId, channel, text/*, rawEvent*/) {
    if (username === this.username) { return; }

    const user = new User(username, userId);

    // if it's a whisper, the channel is in directMessages
    if (this.client.directMessages[channel]) {
      return super.receiveWhisper({ user, text, channel });
    }

    this.receive({ user, text, channel });
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
}
