export { default as Plugin } from './plugin';
export { default as EventPlugin } from './event';
export { default as HTTPPlugin } from './http';

export { ChatPlugin, respond, listen, help, permissionGroup } from './chat';

import * as p from './plugins';
export const plugins = p;
