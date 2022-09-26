import { PermissionLevels } from 'klasa';

export const permissionLevels: PermissionLevels = new PermissionLevels()
  .add(0, () => true)
  .add(6, ({ guild, member }) => guild && member.permissions.has('MANAGE_GUILD'), { fetch: true })
  .add(7, ({ guild, member }) => guild && member === guild.owner, { fetch: true })
  .add(9, ({ author, client }) => author === client.owner, { break: true })
  .add(10, ({ author, client }) => author === client.owner);

