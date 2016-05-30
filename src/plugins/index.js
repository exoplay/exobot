export { default as Plugin } from './plugin';
export { default as MessagePlugin } from './message';
export { default as DatabasePlugin } from './database';
export { default as EventPlugin } from './event';
export { default as HTTPPlugin } from './http';

import * as p from './plugins';
export const plugins = p;
