/* eslint no-param-reassign: 0 */

import Koa from 'koa';
import KoaRouter from 'koa-router';
import KoaBody from 'koa-bodyparser';
import methodOverride from 'koa-methodoverride';
import compress from 'koa-compress';

import { PropTypes as T } from '../../configurable';
import Adapter from '../adapter';

export const buildServer = () => {
  const app = new Koa();

  app.use(KoaBody());
  app.use(methodOverride());
  app.use(compress());

  return app;
};

export const router = opts => new KoaRouter(opts);

export default class HttpAdapter extends Adapter {
  static type = 'HTTP';

  static propTypes = {
    port: T.number.isRequired,
    router: T.object,
  };

  static defaultProps = {
    port: 3000,
    router: router(),
  };

  constructor() {
    super(...arguments);

    this.app = buildServer();
    this.options.router.all('*', this.receiveHTTPRequest.bind(this));
    this.app.use(this.options.router.routes());
    this.server = this.app.listen(this.options.port);

    this.status = Adapter.STATUS.CONNECTED;
  }

  shutdown() {
    this.server.close();
  }

  async receiveHTTPRequest(ctx) {
    const {
      token,
      id,
      channel,
      adapter = this.name,
      whisper,
      text,
    } = { ...ctx.query, ...ctx.body };

    if (!text) {
      ctx.status = 400;
      ctx.body = 'No text sent in.';
      return;
    }

    const command = ctx.query.text.trim();

    if (!token || !id) {
      ctx.status = 403;
      ctx.body = 'No user id or token passed in.';
      return;
    }

    const user = this.bot.users.botUsers[id];

    if (!user || user.token !== token) {
      ctx.status = 403;
      ctx.body = 'User id or token not valid.';
      return;
    }

    const message = this.bot.parseMessage({
      adapter,
      channel,
      whisper: whisper === 'true',
      text: command,
      user,
    });

    const promises = this.bot.receiveMessage(message);
    const resMessages = (await Promise.all(promises)).filter(r => r);

    if (!resMessages || resMessages.length === 0) {
      ctx.status = 404;
      ctx.body = 'Not found.';
      return;
    }

    const body = [];

    resMessages.forEach((m) => {
      if (adapter && adapter !== this.name) {
        let channelText = '';

        if (channel) {
          channelText = ` on channel ${channel}`;
        }

        body.push(`sent ${m.text} to ${adapter}${channelText}`);
      } else {
        body.push(m.text);
      }
    });

    ctx.status = 200;
    ctx.body = body.join('\n');
  }

  send(message) {
    return message;
  }

  getUserIdByUserName(name) {
    return name;
  }

  getRoles() {
    return false;
  }
}
