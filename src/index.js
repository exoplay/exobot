import HTTP from './adapter/adapters/http';
import Shell from './adapter/adapters/shell';

import Config from './plugin/plugins/config';
import Greetings from './plugin/plugins/greetings';
import Help from './plugin/plugins/help';
import Permissions from './plugin/plugins/permissions';
import Uptime from './plugin/plugins/uptime';

export Exobot from './exobot';
export User from './user';
export Adapter from './adapter/adapter';
export * from './plugin/plugin';

export const adapters = { HTTP, Shell };
export const plugins = { Config, Greetings, Help, Permissions, Uptime };
