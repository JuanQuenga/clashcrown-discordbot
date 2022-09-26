import { Collection, TextChannel } from 'discord.js';
import { Command, CommandStore, KlasaClient, KlasaMessage, Settings } from 'klasa';
import { AppLogger } from '../../util/app-logger';

// tslint:disable-next-line:no-default-export
export default class extends Command {
  private logger: AppLogger = new AppLogger('ChannelCommand');

  public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
    super(client, store, file, directory, {
      name: 'channel',
      enabled: true,
      permissionLevel: 0,
      description:
        'Mention the channel(s) you want to restrict commands to.' +
        "If you don't mention any channels, the channel restrictions will be reset.",
      runIn: ['text'],
      // callerPermissions: [Permissions.FLAGS.ADMINISTRATOR, Permissions.FLAGS.MANAGE_GUILD]
    });
  }

  public async run(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
    const channels: Collection<string, TextChannel> = message.mentions.channels;
    const hasChannelsMentioned: boolean = channels != null && channels.size > 0 ? true : false;
    const guildSettings: Settings = this.client.gateways.guilds.get(message.guild.id);
    if (!hasChannelsMentioned) {
      guildSettings.reset('channels');

      return message.reply('Channel restrictions have been reset in this server.') as Promise<KlasaMessage>;
    }

    const channelIds: string[] = channels.map((x: TextChannel) => x.id);
    guildSettings.update('channels', channelIds);

    return message.reply(`Bot usage has been restricted to the provided channels.`) as Promise<KlasaMessage>;
  }
}

