import {
  RtmClient,
  CLIENT_EVENTS,
  RTM_EVENTS,
  //MemoryDataStore,
} from '@slack/client';

import models from '@slack/client/lib/models';

import Adapter from '../adapter';
import User from '../../user';

const dmName = new models.DM()._modelName;

export const EVENTS = {
  [CLIENT_EVENTS.RTM.CONNECTING]: 'slackConnecting',
  [CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED]: 'slackConnected',
  [CLIENT_EVENTS.RTM.AUTHENTICATED]: 'slackAuthenticated',
  [CLIENT_EVENTS.RTM.DISCONNECT]: 'slackDisconnected',
  [CLIENT_EVENTS.RTM.UNABLE_TO_RTM_START]: 'slackUnableToStart',
  [CLIENT_EVENTS.RTM.ATTEMPTING_RECONNECT]: 'slackReconnecting',
  [RTM_EVENTS.MESSAGE]: 'slackMessage',
};

export default class Slack extends Adapter {
  constructor ({ token }) {
    super(...arguments);
    this.token = token;
  }

  register (bot) {
    super.register(...arguments);
    const { token } = this;

    this.client = new RtmClient(token, { logLevel: bot.logLevel });

    Object.keys(EVENTS).forEach(slackEvent => {
      const mappedFn = this[EVENTS[slackEvent]];
      this.client.on(slackEvent, (...args) => mappedFn(...args));
      this.client.on(slackEvent, (...args) => {
        bot.emitter.emit(`slack-${slackEvent}`, ...args);
      });
    });

    this.client.start();
  }

  send (message) {
    this.bot.log.debug(`Sending ${message.text} to ${message.channel}`);
    this.client.sendMessage(message.text, message.channel);
  }

  slackConnecting = () => {
    this.bot.log.info('Connecting to Slack.');
    this.status = Adapter.STATUS.CONNECTING;
  }

  slackConnected = () => {
    this.bot.log.info('Connected to Slack.');
  }

  slackAuthenticated = () => {
    this.bot.log.notice('Successfully authenticated to Slack.');
    this.status = Adapter.STATUS.CONNECTED;
  }

  slackDisconnected = () => {
    this.bot.log.critical('Disconnected from Slack.');
    this.status = Adapter.STATUS.DISCONNECTED;
  }

  slackUnableToStart = () => {
    this.bot.log.critical('Unable to start Slack.');
    this.status = Adapter.STATUS.DISCONNECTED;
  }

  slackReconnecting = () => {
    this.bot.log.notice('Reconnecting to Slack.');
    this.status = Adapter.STATUS.RECONNECTING;
  }

  slackMessage = (message) => {
    const botId = this.client.activeUserId;
    if (message.user === botId) { return; }

    const slackUser = this.client.dataStore.getUserById(message.user);
    let user;

    if (slackUser) {
      user = new User(slackUser.name, slackUser.id);
    } else {
      user = new User(message.user);
    }

    const channel = this.client.dataStore.getChannelGroupOrDMById(message.channel);

    if (channel && channel._modelName === dmName) {
      return this.receiveWhisper({ user, text: message.text, channel: message.channel });
    }

    this.receive({ user, text: message.text, channel: message.channel });
  }
}
