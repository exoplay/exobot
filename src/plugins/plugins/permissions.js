import { v4 as uuid } from 'node-uuid';

import { Plugin, respond, help, permissionGroup } from '../plugin';
import { PropTypes as T } from '../../configurable';
import User from '../../user';

/* eslint no-param-reassign: 0 */

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
  }

  @help('/permissions authorize admin <password> to authorize yourself as an admin');
  @permissionGroup('public');
  @respond(/^permissions authorize admin (.+)$/i);
  admin([, adminPassword], message) {
    // Validate the password - if there is one.
    if (this.options.adminPassword && adminPassword === this.options.adminPassword) {
      const id = this.constructor.nameToId(message.user.id);
      this.bot.addRole(id, 'admin');
      return 'User authorized as admin.';
    }
  }

  @help('/permissions add role <role> to <user> to add a role to a user');
  @permissionGroup('role-management');
  @respond(/^permissions add role (\w+) to (.+)$/i);
  async addRoleToUser([match, role, name], message) {
    role = this.constructor.nameToId(role);
    let userIdDirty;

    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      this.bot.addRole(userId, role);
      return `${name} added to role ${role}.`;
    }
  }

  @help('/permissions view user <user> to view roles given to a user');
  @permissionGroup('role-management');
  @respond(/^permissions view user (.+)$/i);
  async viewUser([match, name], message) {
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
  @respond(/^permissions view effective user (.+)$/i);
  async viewEffectiveUser([match, name], message) {
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
  @respond(/^permissions remove role (\S+) from (.+)$/i);
  async removeRoleFromUser([match, role, name], message) {
    role = this.constructor.nameToId(role);
    let userIdDirty;

    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      this.bot.removeRole(userId, role);
      return `${name} removed from role ${role}.`;
    }
  }

  @help('/permissions add role <permissiongroup> <role> to allow access to a permissionGroup');
  @permissionGroup('role-management');
  @respond(/^permissions add role (\S+) (\S+)$/i);
  addRoleToGroup([, group, role]/* , message*/) {
    role = this.constructor.nameToId(role);

    this.bot.db.set(`permissions.groups.${group}.${role}`, true).value();
    this.bot.db.write();
    return `role "${role}" given permission to commands under group "${group}".`;
  }

  @help('/permissions remove group <permissionGroup> <role> to allow access to a permissionGroup');
  @permissionGroup('role-management');
  @respond(/^permissions remove role (\S+) (\S+)$/i);
  removeRoleFromGroup([, group, role]/* , message*/) {
    role = this.constructor.nameToId(role);

    const dbGroup = this.bot.db.get(`permissions.groups.${group}`).value();
    delete dbGroup[role];
    this.bot.db.set(`permissions.groups.${group}`, dbGroup).value();
    this.bot.db.write();
    return `role "${role}" removed permission to commands under group "${group}".`;
  }

  @help(
    '/permissions view group <permissionGroup> to view roles with access to ' +
    'commands under that permissionGroup',
  );
  @permissionGroup('role-management');
  @respond(/^permissions view group (\S+)$/i);
  viewGroup([, group]/* , message*/) {
    const dbGroup = this.bot.db.get(`permissions.groups.${group}`).value();

    if (dbGroup) {
      const perms = Object.keys(dbGroup);
      return perms.join(', ');
    }

    return `No permissions assigned to ${group}.`;
  }

  @help('/login to recieve a token to claim your users across chat adapters, ' +
    '/login <userIdString> <userToken> to login on another adapter');
  @permissionGroup('public');
  @respond(/^login\s*(\S+)?\s*(\S+)?$/i);
  multipleAdapterLogin([, userId, token], message) {
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

    token = uuid();
    message.user.token = token;
    return 'Please whisper this to the bot on the other adapter \n' +
            `login ${message.user.id} ${token}`;
  }

  @help('/webhook new <name> to create a webhook user to access webhook commands');
  @permissionGroup('role-management');
  @respond(/^webhook new (\S+)$/i);
  newWebhookUser([, name]) {
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
  @respond(/^webhook add role (\S+) (\S+)$/i);
  addWebhookRole([, name, role]) {
    role = this.constructor.nameToId(role);
    let userIdDirty;

    try {
      userIdDirty = this.bot.getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      this.bot.addRole(userId, role);
      return `${name} added to role ${role}.`;
    }
  }

  @help('/webhook remove role <webhook name> <role> to remove a role to a webhook');
  @permissionGroup('role-management');
  @respond(/^webhook remove role (\S+) (\S+)$/i);
  removeWebhookRole([, name, role]) {
    role = this.constructor.nameToId(role);
    let userIdDirty;

    try {
      userIdDirty = this.bot.getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }

    const userId = this.constructor.nameToId(userIdDirty);

    if (userId) {
      this.bot.removeRole(userId, role);
      return `${name} removeed to role ${role}.`;
    }
  }

  @help('/webhook view <name> to view a webhook\'s roles');
  @permissionGroup('role-management');
  @respond(/^webhook view (\S+)?$/i);
  viewWebHook([, name]) {
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
  @respond(/^webhook delete (\S+)$/i);
  deleteWebHook([, name]) {
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
  @respond(/^webhook regenerate (\S+)$/i);
  regenerateWebHook([, name]) {
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
}
