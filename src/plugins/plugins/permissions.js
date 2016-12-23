import { Plugin, respond, help, permissionGroup } from '../plugin';
import { PropTypes as T } from '../../configurable';
import User from '../../user';

import { v4 as uuid } from 'node-uuid';

export class Permissions extends Plugin {
  static type = 'permissions';
  static defaultDatabase = { permissions: {} };

  static propTypes = {
    adminPassword: T.string.isRequired,
  };

  static nameToId = (name) => {
    if (name) {
      return name.replace(/[^\w-]/g, '').toLowerCase();
    }
    return;
  }

  /*
  @help('/permissions authorize admin <password> to authorize yourself as an admin');
  @permissionGroup('public');
  @respond('permissions authorize admin :adminPassword');
  admin (message) {
    const { adminPassword } = message.params;
    // Validate the password - if there is one.
    if (this.options.adminPassword && adminPassword === this.options.adminPassword) {
      const id = this.constructor.nameToId(message.user.id);
      this.bot.addRole(id, 'admin');
      return 'User authorized as admin.';
    }
  }
  */

  @help('/permissions add role <role> to <user> to add a role to a user');
  @permissionGroup('role-management');
  @respond('permissions add role :role to :name');
  async addRoleToUser (message) {
    console.log('user');
    const { role, name } = message.params;
    const roleId = this.constructor.nameToId(role);

    let userIdDirty;

    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      this.bot.addRole(userId, roleId);
      return `${name} added to role ${role}.`;
    }
  }

  /*
  @help('/permissions view user <user> to view roles given to a user');
  @permissionGroup('role-management');
  @respond('permissions view user :name');
  async viewUser (message) {
    const { name } = message.params;
    let userIdDirty;

    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      const perms = this.bot.getRoles(userId);
      return perms.join(', ');
    }
  }

  @help('/permissions view effective user <user> to view all roles assigned to <user>');
  @permissionGroup('role-management');
  @respond('permissions view effective user :name');
  async viewEffectiveUser (message) {
    const { name } = message.params;
    let userIdDirty;

    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      const perms = this.bot.getUserRoles(userId);
      return perms.join(', ');
    }
  }

  @help('/permissions remove role <role> from <user> to remove a role from a user');
  @permissionGroup('role-management');
  @respond('permissions remove role :role from :name');
  async removeRoleFromUser (message) {
    const { role, name } = message.params;
    const roleId = this.constructor.nameToId(role);
    let userIdDirty;

    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      this.bot.removeRole(userId, roleId);
      return `${name} removed from role ${role}.`;
    }
  }
  */

  @help('/permissions add role <permissiongroup> <role> to allow access to a permissionGroup');
  @permissionGroup('role-management');
  @respond('permissions add role :permissionGroup :role');
  addRoleToGroup (message) {
    console.log('group');
    const { permissionGroup, role } = message.params;
    const roleId = this.constructor.nameToId(role);

    this.bot.db.set(`permissions.groups.${permissionGroup}.${roleId}`, true).value();
    this.bot.db.write();
    return `role "${role}" given permission to commands under group "${permissionGroup}".`;
  }

  /*
  @help('/permissions remove group <permissionGroup> <role> to allow access to a permissionGroup');
  @permissionGroup('role-management');
  @respond('permissions remove role :permissionGroup :role');
  removeRoleFromGroup (message) {
    const { permissionGroup, role } = message.params;
    const roleId = this.constructor.nameToId(role);

    const group = this.bot.db.get(`permissions.groups.${permissionGroup}`).value();
    delete group[roleId];

    this.bot.db.set(`permissions.groups.${permissionGroup}`, group).value();
    this.bot.db.write();

    return `role "${role}" removed permission to commands under group "${permissionGroup}".`;
  }

  @help(
    '/permissions view group <permissionGroup> to view roles with access to ' +
    'commands under that permissionGroup'
  );
  @permissionGroup('role-management');
  @respond('permissions view group :group');
  viewGroup (message) {
    const { group } = message.params;
    const perms = Object.keys(this.bot.db.get(`permissions.groups.${group}`).value() || {});

    if (perms) {
      return perms.join(', ');
    }

    return `Group ${group} not found or has no permissions.`;
  }

  @help('/login to recieve a token to claim your users across chat adapters, ' +
    '/login <userIdString> <userToken> to login on another adapter');
  @permissionGroup('public');
  @respond('login :credentials*');
  multipleAdapterLogin (message) {
    const { credentials = '' } = message.params;
    const [userId, token] = credentials.split(' ');

    if (userId && token) {
      const user = this.bot.users.botUsers[userId];
      if (user && user.id !== message.user.id) {
        if (user.token === token) {
          user.token = undefined;
          return this.bot.mergeUsers(user, message.user);
        }
      }

      return 'Wrong userId or token specified';
    }

    message.user.token = uuid();
    return 'Please whisper this to the bot on the other adapter \n' +
            `login ${message.user.id} ${message.user.token}`;
  }

  @help('/webhook new <name> to create a webhook user to access webhook commands');
  @permissionGroup('role-management');
  @respond('webhook new :name');
  newWebhookUser(message) {
    const { name } = message.params;
    const user = new User();
    user.name = `webhook-${name}`;
    user.token = uuid();
    user.isWebhook = true;
    this.bot.addUser(user);

    return `Set up your webhook with id=${user.id} & token=${user.token} after giving it ` +
           `permissions with \`/webhook add role ${user.name} <role>\``;
  }

  @help('/webhook add role <webhook name> <role> to add a role to a webhook');
  @permissionGroup('role-management');
  @respond('webhook add role :name :role');
  addWebhookRole(message) {
    const { name, role } = message.params;
    const roleId = this.constructor.nameToId(role);
    let userIdDirty;

    try {
      userIdDirty = this.bot.getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      this.bot.addRole(userId, roleId);
      return `${name} added to role ${role}.`;
    }
  }

  @help('/webhook remove role <webhook name> <role> to remove a role to a webhook');
  @permissionGroup('role-management');
  @respond('webhook remove role :name :role');
  removeWebhookRole(message) {
    const { name, role } = message.params;
    const roleId = this.constructor.nameToId(role);

    let userIdDirty;

    try {
      userIdDirty = this.bot.getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      this.bot.removeRole(userId, roleId);
      return `${name} removeed to role ${role}.`;
    }
  }

  @help('/webhook view <name> to view a webhook\'s roles');
  @permissionGroup('role-management');
  @respond('webhook view :name');
  viewWebHook(message) {
    const { name } = message.params;
    let userIdDirty;

    try {
      userIdDirty = this.bot.getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      const perms = this.bot.getRoles(userId);
      return perms.join(', ');
    }
  }

  @help('/webhook delete <name> to delete a webhook');
  @permissionGroup('role-management');
  @respond('webhook delete :name');
  deleteWebHook(message) {
    const { name } = message.params;
    let userIdDirty;

    try {
      userIdDirty = this.bot.getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      delete this.bot.users.botUsers[userId];
      this.bot.db.write();
      return `Webhook ${name} deleted.`;
    }

    return `Webhook ${name} not found.`;
  }

  @help('/webhook regenerate <name> to regenerate a webhook\'s token');
  @permissionGroup('role-management');
  @respond('webhook regenerate :name');
  regenerateWebHook(message) {
    const { name } = message.params;
    let userIdDirty;

    try {
      userIdDirty = this.bot.getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      const user = this.bot.users.botUsers[userId];
      user.token = uuid();
      this.bot.users.botUsers[userId] = user;
      this.bot.db.write();
      return `${name} token is now ${user.token}.`;
    }
  }
  */
}
