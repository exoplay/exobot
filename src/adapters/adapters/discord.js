import Discord from 'discord.io';

import Adapter from '../adapter';
import User from '../../user';

export const EVENTS = {
  ready: 'discordReady',
  message: 'discordMessage',
  presence: 'discordPresence',
  disconnected: 'discordDisconnected',
};

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
      this.status = Adapter.STATUS.ERROR;
      bot.log.error('token, botId, and username are required to connect to discord.');
      return;
    }

    this.client = new Discord.Client({
      token,
      autorun: true,
    });

    Object.keys(EVENTS).forEach(discordEvent => {
      const mappedFn = this[EVENTS[discordEvent]];
      this.client.on(discordEvent, (...args) => mappedFn(...args));
      this.client.on(discordEvent, (...args) => {
        this.bot.emitter.emit(`discord-${discordEvent}`, ...args);
      });
    });
  }

  send (message) {
    this.bot.log.debug(`Sending ${message.text} to ${message.channel}`);

    this.client.sendMessage({
      to: message.channel,
      message: message.text,
    });
  }

  discordReady = () => {
    this.status = Adapter.STATUS.CONNECTED;

    this.bot.emitter.emit('connected', this.id);
    this.bot.log.notice('Connected to Discord.');

    this.client.setPresence({
      game: 'Exobotting',
    });
  }

  discordDisconnected = () => {
    this.status = Adapter.STATUS.DISCONNECTED;
    this.bot.log.critical('Disconnected from Discord.');
  }

  discordMessage (username, userId, channel, text/*, rawEvent*/) {
    if (username === this.username) { return; }

    const user = new User(username, userId);

    // if it's a whisper, the channel is in directMessages
    if (this.client.directMessages[channel]) {
      return super.receiveWhisper({ user, text, channel });
    }

    this.receive({ user, text, channel });
  }

  discordPresence (username, userId, status, gameName, rawEvent) {
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
