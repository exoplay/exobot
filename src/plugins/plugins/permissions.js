import { ChatPlugin, respond, help, permissionGroup } from '../chat';

export class Permissions extends ChatPlugin {
  name = 'permissions';

  static nameToId = (name) => {
    return name.replace(/[^\w]/g, '').toLowerCase();
  }

  constructor (options) {
    super(...arguments);

    if (options) {
      this.adminPassword = options.adminPassword;
    }
  }

  register (bot) {
    super.register(bot);
    this.database('permissions', { });

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
      this.bot.db.set(`permissions.users.${id}.roles.admin`, true).value();
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

    const userId = Permissions.nameToId(
      this.bot.adapters[message.adapter].getUserIdByUserName(name)
    );

    if (userId) {
      this.bot.db.set(`permissions.users.${userId}.roles.${role}`, true).value();
      this.bot.db.write();
      return `${name} added to role ${role}.`;
    }
  }

  @help('/permissions view user <user> to view roles given to a user');
  @permissionGroup('role-management');
  @respond(/^permissions view user (\w+)$/i);
  async viewUser ([match, name], message) {
    await this.databaseInitialized();

    const userId = Permissions.nameToId(
      this.bot.adapters[message.adapter].getUserIdByUserName(name)
    );

    if (userId) {
      const perms = Object.keys(this.bot.db.get(`permissions.users.${userId}.roles`).value());
      return perms.join(', ');
    }
  }

  @help('/permissions remove user <user> <role> to remove a role from a user');
  @permissionGroup('role-management');
  @respond(/^permissions remove user (\w+) (\w+)$/i);
  async removeRoleFromUser ([match, name, role], message) {
    role = Permissions.nameToId(role);
    await this.databaseInitialized();

    const userId = Permissions.nameToId(
      this.bot.adapters[message.adapter].getUserIdByUserName(name)
    );

    if (userId) {
      const roles = this.bot.db.get(`permissions.users.${userId}.roles`).value();
      delete roles[role];
      this.bot.db.set(`permissions.users.${userId}.roles`, roles).value();
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
  @respond(/^permissions view group (\w+)$/i);
  async viewGroup ([, group]/*, message*/) {
    await this.databaseInitialized();

    const perms = Object.keys(this.bot.db.get(`permissions.groups.${group}`).value());
    return perms.join(', ');
  }
}
