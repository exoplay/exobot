import Koa from 'koa';
import KoaRouter from 'koa-router';
import body from 'koa-bodyparser';
import methodOverride from 'koa-methodoverride';
import compress from 'koa-compress';

import { PropTypes as T } from '../../configurable';
import Adapter from '../adapter';

export const server = () => {
  const server = new Koa();

  server.use(body());
  server.use(methodOverride());
  server.use(compress());

  return server;
};

export const router = (opts) => new KoaRouter(opts);

const SLASH_REGEX = /\//g;

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

  constructor () {
    super(...arguments);

    this.server = server();
    this.options.router.all('*', this.receiveHTTPRequest.bind(this));
    this.server.use(this.options.router.routes());
    this.server.listen(this.options.port);

    this.status = Adapter.STATUS.CONNECTED;
  }

  async receiveHTTPRequest (ctx) {
    const command = ctx.path.replace(SLASH_REGEX, ' ').trim();
    console.log('received', command);

    const {
      token,
      id,
      channel,
      adapter = this.name,
      whisper,
    } = { ...ctx.query, ...ctx.body };

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
      user: user,
    });

    const resMessage = await this.bot.receiveMessage(message);

    if (!resMessage) {
      ctx.status = 404;
      ctx.body = 'Not found.';
      return;
    }

    const body = resMessage.text;

    if (adapter) {
      body.push(`sent to ${adapter}`);
    }

    if (channel) {
      body.push(`on channel ${channel}`);
    }

    ctx.status = 200;
    ctx.body = body.join(' ');
    return ctx;
  }

  send (message) {
    return message;
  }

  getUserIdByUserName (name) {
    return name;
  }

  getRoles() {
    return false;
  }
}
