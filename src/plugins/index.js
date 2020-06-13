import Config from './plugins/config';
import Greetings from './plugins/greetings';
import Help from './plugins/help';
import Node from './plugins/node';
import Permissions from './plugins/permissions';
import Uptime from './plugins/uptime';

export {
 Plugin, respond, listen, help, permissionGroup,
} from './plugin';

export const Plugins = {
  Config,
  Greetings,
  Help,
  Node,
  Permissions,
  Uptime,
};
