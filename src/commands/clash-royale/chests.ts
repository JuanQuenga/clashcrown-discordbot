import { MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import prettyHrtime from 'pretty-hrtime';
import { StatsClient } from '../../client/stats-client';
import { IApiPlayerProfile } from '../../config/interfaces/player-profile';
import { IApiPlayersUpcomingChests, IApiUpcomingChest } from '../../config/interfaces/player-upcoming-chests';
import { AppLogger } from '../../util/app-logger';
import { EmbedHelper } from '../../util/embed-helper';
import { ParseHelper } from '../../util/parse-helper';

//tslint:disable:max-line-length
const chestThumbnails: {[chestName: string]: string} = {
  'Wooden Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/3/30/WoodenChest.png/revision/latest/scale-to-width-down/160?cb=20160209231106',
  'Silver Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/0/07/SilverChest.png/revision/latest/scale-to-width-down/160?cb=20160209231106',
  'Golden Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/8/8b/GoldenChest.png/revision/latest/scale-to-width-down/160?cb=20160209231105',
  'Giant Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/d/da/Giant_chest.png/revision/latest/scale-to-width-down/120?cb=20160306083332',
  'Magical Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/9/93/MagicalChest.png/revision/latest/scale-to-width-down/160?cb=20160312171354',
  'Epic Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/f/f5/EpicChest.png/revision/latest/scale-to-width-down/120?cb=20160923080038',
  'Super Magical Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/6/65/SuperMagicalChest.png/revision/latest/scale-to-width-down/120?cb=20161224214132',
  'Legendary Chest':
    'https://vignette.wikia.nocookie.net/clashroyale/images/a/a1/LegendChest.png/revision/latest/scale-to-width-down/120?cb=20161002204147'
};
//tslint:enable:max-line-length

// tslint:disable-next-line:no-default-export
export default class extends Command {
  private logger: AppLogger = new AppLogger('ChestsCommand');
  private statsClient: StatsClient;

  public constructor(client: StatsClient, store: CommandStore, file: string[], directory: string) {
    super(client, store, file, directory, {
      name: 'chests',
      enabled: true,
      description: 'Requests upcoming chest info for a Clash Royale player.',
      usage: '[hashtagArg:str]'
    });
    this.statsClient = client;
  }

  public async run(message: KlasaMessage, [hashtagArg]: string[]): Promise<KlasaMessage | KlasaMessage[]> {
    // tslint:disable-next-line: no-floating-promises
    message.channel.startTyping();

    const startWatch: [number, number] = process.hrtime();
    let hashtag: string;
    try {
      hashtag = await ParseHelper.tryParseHashtag(message, hashtagArg);
    } catch (err) {
      message.channel.stopTyping();

      return message.reply(err.message) as Promise<KlasaMessage>;
    }

    try {
      const p1: Promise<IApiPlayerProfile> = this.statsClient.crApi.playerProfile(hashtag);
      const p2: Promise<IApiPlayersUpcomingChests> = this.statsClient.crApi.playersUpcomingChests(hashtag);
      const [profile, chests] = await Promise.all([p1, p2]);
      const stopWatch: [number, number] = process.hrtime(startWatch);
      const elapsed: string = prettyHrtime(stopWatch);
      const embed: MessageEmbed = this.createChestEmbed(profile, chests, elapsed);

      return message.reply('Here you go!', { embed }) as Promise<KlasaMessage>;
    } catch (err) {
      // Handle API errors
      if (err.response != null && err.response.status !== 200) {
        return EmbedHelper.sendApiErrorResponse(message, err.response.status);
      }
      this.logger.error(`Unknown error while requesting profile ${hashtag}`, err.stack);

      return message.reply('Something went wrong while fetching your profile. Developers have been informed.') as Promise<KlasaMessage>;
    } finally {
      message.channel.stopTyping();
    }
  }

  /**
   * Returns an MessageEmbed for a players upcoming chests.
   */
  private createChestEmbed(profile: IApiPlayerProfile, chests: IApiPlayersUpcomingChests, elapsed: string): MessageEmbed {
    const embed: MessageEmbed = new MessageEmbed();
    EmbedHelper.setCommonAuthor(embed, profile, this.statsClient.emojiHelper.getEmojiUrlByName(profile.arena.id.toString()));
    EmbedHelper.setCommonColor(embed);
    EmbedHelper.setCommonFooter(embed, elapsed, this.client.user.displayAvatarURL());
    const chestName: string = chests.items[0].name;
    embed.setThumbnail(chestThumbnails[chestName]);
    // Upcoming chest + Special Chests
    this.addUpcomingChestsFields(embed, chests);

    return embed;
  }

  /**
   * Adds fields to the MessageEmbed for a player's upcoming chests.
   */
  private addUpcomingChestsFields(embed: MessageEmbed, chests: IApiPlayersUpcomingChests): void {
    // Chests
    let upcomingChestsContent: string = '';
    let upcomingSpecialChestsContent: string = '';
    chests.items.forEach((chest: IApiUpcomingChest, index: number) => {
      const chestEmoji: string = this.statsClient.emojiHelper.getChestEmojiByName(chest.name);

      if (index < 9) {
        if (index === 1) {
          upcomingChestsContent += ' ← ';
        }
        // Only add 7 chests so that we can show upcoming + special chests in one line
        upcomingChestsContent += `${chestEmoji}`;
      } else {
        upcomingSpecialChestsContent += `${chestEmoji}${chest.index + 1}`;
      }
    });
    // embed.addBlankField(true);
    embed.addField('Upcoming Chests', upcomingChestsContent);
    embed.addField('Special Chests', upcomingSpecialChestsContent);
  }
}

type ChestThumbnails = {
  'Wooden Chest': string;
  'Silver Chest': string;
  'Golden Chest': string;
  'Giant Chest': string;
  'Magical Chest': string;
  'Epic Chest': string;
  'Super Magical Chest': string;
  'Legendary Chest': string;
};
