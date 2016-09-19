import { ChatPlugin, respond, help, permissionGroup } from '../chat';
import { v4 as uuid } from 'node-uuid';

export class Permissions extends ChatPlugin {
  name = 'permissions';
  defaultDatabase = { permissions: {} };

  static nameToId = (name) => {
    return name.replace(/[^\w-]/g, '').toLowerCase();
  }

  constructor (options) {
    super(...arguments);

    if (options) {
      this.adminPassword = options.adminPassword;
    }
  }

  register (bot) {
    super.register(bot);

    if (!this.adminPassword) {
      bot.log.error('No adminPassword provided to Permissions plugin');
    }
  }

  @help('/permissions authorize admin <password> to authorize yourself as an admin');
  @permissionGroup('public');
  @respond(/^permissions authorize admin (\S+)$/i);
  async admin ([, adminPassword], message) {
    await this.databaseInitialized();

    // Validate the password - if there is one.
    if (this.adminPassword && adminPassword === this.adminPassword) {
      const id = Permissions.nameToId(message.user.id);
      this.bot.users.botUsers[id].roles.admin = true;
      this.bot.db.write();
      return 'User authorized as admin.';
    }
  }

  @help('/permissions add user <user> <role> to add a role to a user');
  @permissionGroup('role-management');
  @respond(/^permissions add user (\w+) (\w+)$/i);
  async addRoleToUser ([match, name, role], message) {
    role = Permissions.nameToId(role);
    await this.databaseInitialized();
    let userIdDirty;
    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      console.log(err);
    }
    const userId = Permissions.nameToId(userIdDirty);
    if (userId) {
      this.bot.users.botUsers[userId].roles[role] = true;
      this.bot.db.write();
      return `${name} added to role ${role}.`;
    }
  }

  @help('/permissions view user <user> to view roles given to a user');
  @permissionGroup('role-management');
  @respond(/^permissions view user (\w+)$/i);
  async viewUser ([match, name], message) {
    await this.databaseInitialized();
    let userIdDirty;
    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      console.log(err);
    }
    const userId = Permissions.nameToId(userIdDirty);
    if (userId) {
      const perms = Object.keys(this.bot.users.botUsers[userId].roles);
      return perms.join(', ');
    }
  }

  @help('/permissions remove user <user> <role> to remove a role from a user');
  @permissionGroup('role-management');
  @respond(/^permissions remove user (\w+) (\w+)$/i);
  async removeRoleFromUser ([match, name, role], message) {
    role = Permissions.nameToId(role);
    await this.databaseInitialized();
    let userIdDirty;
    try {
      userIdDirty = await this.bot.adapters[message.adapter].getUserIdByUserName(name);
    } catch (err) {
      console.log(err);
    }
    const userId = Permissions.nameToId(userIdDirty);
    if (userId) {
      const roles = this.bot.users.botUsers[userId].roles;
      delete roles[role];
      this.bot.db.write();
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

  @help('/login userIdString userToken');
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
    token = uuid().replace(/[-]/g, '').substring(0,15);
    message.user.token = token;
    return 'Please whisper this to the bot on the other adapter \n' +
            `login ${message.user.id} ${token}`;
  }

}
