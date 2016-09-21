import { ChatPlugin, respond, help, permissionGroup } from '../chat';
import { PropTypes as T } from '../../exobot';

import { v4 as uuid } from 'node-uuid';

export class Permissions extends ChatPlugin {
  name = 'permissions';
  defaultDatabase = { permissions: {} };

  propTypes = {
    adminPassword: T.string.isRequired,
  };

  static nameToId = (name) => {
    if (name) {
      return name.replace(/[^\w-]/g, '').toLowerCase();
    }
    return;
  }

  @help('/permissions authorize admin <password> to authorize yourself as an admin');
  @permissionGroup('public');
  @respond(/^permissions authorize admin (.+)$/i);
  async admin ([, adminPassword], message) {
    await this.databaseInitialized();

    // Validate the password - if there is one.
    if (this.options.adminPassword && adminPassword === this.options.adminPassword) {
      const id = Permissions.nameToId(message.user.id);
      this.bot.addRole(id, 'admin');
      return 'User authorized as admin.';
    }
  }

  @help('/permissions add role <role> to <user> to add a role to a user');
  @permissionGroup('role-management');
  @respond(/^permissions add role (\w+) to (.+)$/i);
  async addRoleToUser ([match, role, name], message) {
    role = Permissions.nameToId(role);
    await this.databaseInitialized();
    let userIdDirty;
    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }
    const userId = Permissions.nameToId(userIdDirty);
    if (userId) {
      this.bot.addRole(userId, role);
      return `${name} added to role ${role}.`;
    }
  }

  @help('/permissions view user <user> to view roles given to a user');
  @permissionGroup('role-management');
  @respond(/^permissions view user (.+)$/i);
  async viewUser ([match, name], message) {
    await this.databaseInitialized();
    let userIdDirty;
    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }
    const userId = Permissions.nameToId(userIdDirty);
    if (userId) {
      const perms = this.bot.getRoles(userId);
      return perms.join(', ');
    }
  }

  @help('/permissions view effective user <user> to view all roles assigned to <user>');
  @permissionGroup('role-management');
  @respond(/^permissions view effective user (.+)$/i);
  async viewEffectiveUser ([match, name], message) {
    await this.databaseInitialized();
    let userIdDirty;
    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }
    const userId = Permissions.nameToId(userIdDirty);
    if (userId) {
      const perms = this.bot.getUserRoles(userId);
      return perms.join(', ');
    }
  }

  @help('/permissions remove role <role> from <user> to remove a role from a user');
  @permissionGroup('role-management');
  @respond(/^permissions remove role (\w+) from (.+)$/i);
  async removeRoleFromUser ([match, role, name], message) {
    role = Permissions.nameToId(role);
    await this.databaseInitialized();
    let userIdDirty;
    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      this.bot.log.warn(err);
    }
    const userId = Permissions.nameToId(userIdDirty);
    if (userId) {
      this.bot.removeRole(userId, role);
      return `${name} removed from role ${role}.`;
    }
  }

  @help('/permissions add role <permissiongroup> <role> to allow access to a permissionGroup');
  @permissionGroup('role-management');
  @respond(/^permissions add role (\S+) (\w+)$/i);
  async addRoleToGroup ([, permissionGroup, role]/*, message*/) {
    role = Permissions.nameToId(role);
    await this.databaseInitialized();

    this.bot.db.set(`permissions.groups.${permissionGroup}.${role}`, true).value();
    this.bot.db.write();
    return `role "${role}" given permission to commands under group "${permissionGroup}".`;
  }

  @help('/permissions remove group <permissionGroup> <role> to allow access to a permissionGroup');
  @permissionGroup('role-management');
  @respond(/^permissions remove role (\S+) (\w+)$/i);
  async removeRoleFromGroup ([, permissionGroup, role]/*, message*/) {
    role = Permissions.nameToId(role);
    await this.databaseInitialized();

    const group = this.bot.db.get(`permissions.groups.${permissionGroup}`).value();
    delete group[role];
    this.bot.db.set(`permissions.groups.${permissionGroup}`, group).value();
    this.bot.db.write();
    return `role "${role}" removed permission to commands under group "${permissionGroup}".`;
  }

  @help(
    '/permissions view group <permissionGroup> to view roles with access to ' +
    'commands under that permissionGroup'
  );
  @permissionGroup('role-management');
  @respond(/^permissions view group (\S+)$/i);
  async viewGroup ([, group]/*, message*/) {
    await this.databaseInitialized();

    const perms = Object.keys(this.bot.db.get(`permissions.groups.${group}`).value());
    return perms.join(', ');
  }

  @help('/login to recieve a token to claim your users across chat adapters, ' +
    '/login <userIdString> <userToken> to login on another adapter');
  @permissionGroup('public');
  @respond(/^login\s*(\S+)?\s*(\S+)?$/i);
  async multipleAdapterLogin ([, userId, token], message) {
    await this.databaseInitialized();
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

}
