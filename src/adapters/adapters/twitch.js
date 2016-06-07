import Adapter from '../adapter';
import User from '../../user';

import TMI from 'tmi.js';

export const EVENTS = {
  connecting: 'twitchConnecting',
  connected: 'twitchConnected',
  logon: 'twitchLogon',
  disconnected: 'twitchDisconnected',
  reconnect: 'twitchReconnect',
  chat: 'twitchChat',
  emoteonly: 'twitchEmoteonly',
  join: 'twitchJoin',
  part: 'twitchPart',
  mods: 'twitchMods',
  notice: 'twitchNotice',
  ping: 'twitchPing',
  pong: 'twitchPong',
  roomstate: 'twitchRoomstate',
  slowmode: 'twitchSlowmode',
  subscribers: 'twitchSubscribers',
  subscription: 'twitchSubscription',
  timeout: 'twitchTimeout',
  whisper: 'twitchWhisper',
};

export default class TwitchAdapter extends Adapter {
  constructor ({ username, oauthPassword, channels=[] }) {
    super(...arguments);

    this.username = username;
    this.oauthPassword = oauthPassword;
    this.channels = channels;
  }

  register (bot) {
    super.register(...arguments);

    const { username, oauthPassword, channels } = this;

    if (!username || !oauthPassword) {
      bot.log.error('username and oauthPassword are required to connect to Twitch.');
      return;
    }

    if (!channels.length) {
      bot.log.critical('No channels passed to Twitch adapter to connect to.');
    }

    this.client = new TMI.client({
      channels,
      identity: {
        username,
        password: oauthPassword,
      },
      options: {
        debug: true,
      },
      secure: true,
      reconnect: true,
      logger: {
        info: bot.log.info.bind(bot.log),
        warn: bot.log.warning.bind(bot.log),
        error: bot.log.error.bind(bot.log),
      },
      connection: {
        cluster: 'aws',
      },
    });

    this.client.connect();

    Object.keys(EVENTS).forEach(twitchEvent => {
      const mappedFn = this[EVENTS[twitchEvent]];
      this.client.on(twitchEvent, (...args) => mappedFn(...args));
      this.client.on(twitchEvent, (...args) => this.bot.emit(`twitch-${twitchEvent}`, ...args));
    });
  }

  send (message) {
    this.bot.log.debug(`Sending ${message.text} to ${message.channel}`);

    if (message.whisper) {
      return this.client.whisper(message.user.name, message.text);
    }

    this.client.say(message.channel, message.text);
  }

  twitchConnecting = () => {
    this.status = Adapter.STATUS.CONNECTING;
  }

  twitchConnected = () => {
    this.status = Adapter.STATUS.CONNECTED;
    this.bot.emit('connected', this.id);
    this.bot.log.notice('Connected to Twitch.');
  }

  twitchLogon = () => {
    this.status = Adapter.STATUS.CONNECTED;
    this.bot.log.notice('Successfully logged on to Twitch.');
  }

  twitchDisconnected = () => {
    this.status = Adapter.STATUS.DISCONNECTED;
    this.bot.log.warning('Disconnected from Twitch.');
  }

  twitchReconnect = () => {
    this.status = Adapter.STATUS.RECONNECTING;
    this.bot.log.notice('Reconnecting to Twitch.');
  }

  twitchChat = (channel, twitchUser, text) => {
    if (twitchUser.username === this.username) { return; }
    const user = new User(twitchUser.username);
    this.receive({ user, text, channel });
  }

  twitchEmoteonly = () => {
  }

  twitchJoin = (channel, username) => {
    if (username !== this.username) { return; }
    const user = new User(username);
    return this.enter({ user, channel });
  }

  twitchPart = (channel, username) => {
    if (username !== this.username) { return; }
    const user = new User(username);
    return this.leave({ user, channel });
  }

  twitchPing = () => {
    this.ping();
  }

  twitchWhisper = (twitchUser, text) => {
    if (twitchUser.username === this.username) { return; }
    const user = new User(twitchUser.username);
    this.receiveWhisper({ user, text, channel: twitchUser.username });
  }

  twitchPong = () => { }

  twitchRoomstate = () => { }

  twitchSlowmode = () => { }

  twitchSubscribers = () => { }

  twitchSubscription = () => { }

  twitchTimeout = () => { }

  twitchMods = () => { }

  twitchNotice = () => { }

}
