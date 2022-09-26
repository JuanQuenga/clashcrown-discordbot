import { Command, CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { AppLogger } from '../../util/app-logger';

// tslint:disable-next-line:no-default-export
export default class extends Command {
  private logger: AppLogger = new AppLogger('InviteCommand');

  constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
    super(client, store, file, directory, {
      name: 'invite',
      enabled: true,
      permissionLevel: 0
    });
  }

  public async run(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
    // tslint:disable-next-line: no-floating-promises
    return message.reply(
      // tslint:disable-next-line:prefer-template
      `You can invite me to your server with this link:\n` +
        `<https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=281600>\n\n` +
        `The default prefix for commands is \`!\`. ` +
        `You can change this with the \`setprefix\` command.\nIf you ever forget the command prefix, ` +
        `just use \`@${message.client.user.tag} prefix\`. ` +
        `Enjoy using ${this.client.user.username} for your Clash Royale server! 👏`
    ) as Promise<KlasaMessage>;
  }
}
