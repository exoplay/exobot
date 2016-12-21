const Koa = require('koa');
const body = require('koa-better-body');
const KoaRouter = require('koa-router');
const methodOverride = require('koa-methodoverride');
const compress = require('koa-compress');

export const server = ({ port }) => {
  const server = new Koa();

  //server.use(body());
  //server.use(methodOverride());
  //server.use(compress());

  return server;
};

export const router = (opts) => new KoaRouter(opts);
