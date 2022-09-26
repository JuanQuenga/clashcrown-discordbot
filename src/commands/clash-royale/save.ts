import { Command, CommandStore, KlasaMessage, Settings } from 'klasa';
import { StatsClient } from '../../client/stats-client';
import { AppLogger } from '../../util/app-logger';
import { HashtagHelper } from '../../util/hashtag-helper';

// tslint:disable-next-line:no-default-export
export default class extends Command {
  private logger: AppLogger = new AppLogger('SaveCommand');
  private statsClient: StatsClient;

  public constructor(client: StatsClient, store: CommandStore, file: string[], directory: string) {
    super(client, store, file, directory, {
      name: 'save',
      enabled: true,
      aliases: ['store', 'link'],
      description: 'Saves a Clash Royale player hashtag for your discord account.',
      usage: '[hashtagArg:str]'
    });
    this.statsClient = client;
  }

  public async run(message: KlasaMessage, [hashtagArg]: string[]): Promise<KlasaMessage | KlasaMessage[]> {
    if (!hashtagArg) { return message.reply('no hashtag provided.') as Promise<KlasaMessage>; }
    message.channel.startTyping();
    const hashtag: string = HashtagHelper.normalizeHashtag(hashtagArg);

    // Validate hashtag
    if (!HashtagHelper.isValidHashtag(hashtag)) {
      message.channel.stopTyping();

      return message.reply('invalid hashtag provided.') as Promise<KlasaMessage>;
    }

    // Check if the API can find a profile with the provided hashtag
    try {
      await this.statsClient.crApi.playerProfile(hashtag);
    } catch (err) {
      if (err.response != null) {
        switch (err.response.status) {
          case 404:
            message.send('a profile with this hashtag does not exist. Please recheck the provided tag.');
            message.channel.stopTyping();

            return;
          default:
        }
      }
    }

    // Link hashtag to the discord user
    const userSettings: Settings = this.client.gateways.users.get(message.author.id);
    userSettings.update('hashtag', hashtag);
    message.reply(`your profile #${hashtag} has been linked to your discord account.`);
    message.channel.stopTyping();

    return;
  }
}
