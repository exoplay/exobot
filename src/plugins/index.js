export { default as Plugin } from './plugin';
export { default as EventPlugin } from './event';
export { default as HTTPPlugin } from './http';

export { default as ChatPlugin } from './chat';
export { respond, listen, help, permissionGroup } from './chat';

import * as p from './plugins';
export const plugins = p;
