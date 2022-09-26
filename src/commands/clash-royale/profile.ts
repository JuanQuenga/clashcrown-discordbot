import { Canvas, CanvasRenderingContext2D, createCanvas, Image } from 'canvas';
import commaNumber from 'comma-number';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import prettyHrtime from 'pretty-hrtime';
import { StatsClient } from '../../client/stats-client';
import { IApiLeagueStatistics, IApiPlayerProfile, } from '../../config/interfaces/player-profile';
import { IApiPlayersUpcomingChests, IApiUpcomingChest } from '../../config/interfaces/player-upcoming-chests';
import { IStatsRoyaleCard } from '../../storages/card-storage';
import { AppLogger } from '../../util/app-logger';
import { EmbedHelper } from '../../util/embed-helper';
import { EmojiHelper } from '../../util/emoji-helper';
import { ParseHelper } from '../../util/parse-helper';

/**
 * Profile Command
 */

// tslint:disable:no-unsafe-any
// tslint:disable-next-line:no-default-export
export default class extends Command {
  private logger: AppLogger = new AppLogger('ProfileCommand');
  private statsClient: StatsClient;

  public constructor(client: StatsClient, store: CommandStore, file: string[], directory: string) {
    super(client, store, file, directory, {
      name: 'profile',
      enabled: true,
      description: 'Requests profile info for a Clash Royale player.',
      usage: '[hashtagArg:str]'
    });

    this.statsClient = client;
  }

  public async run(message: KlasaMessage, [hashtagArg]: string[]): Promise<KlasaMessage | KlasaMessage[]> {
    message.channel.startTyping(); //tslint:disable-line:no-floating-promises
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
      const embed: MessageEmbed = this.sketchyProfileEmbeds(profile, chests, elapsed);

      return message.reply('Here you go!', { embed }) as Promise<KlasaMessage>;
    } catch (err) {
      // Handle API errors
      if (err.response != null && err.response.status !== 200) {
        return EmbedHelper.sendApiErrorResponse(message, err.response.status);
      }
      console.log(err); //tslint:disable-line
      this.logger.error(`Unknown error while requesting profile ${hashtag}`, err.stack);

      return message.reply('Something went wrong while fetching your profile. Developers have been informed.') as Promise<KlasaMessage>;
    } finally {
      message.channel.stopTyping();
    }
  }

  private async assignRoles(profile: IApiPlayerProfile): Promise<boolean> {

    return;
  }

  /**
   * Returns an embedarray for player profiles.
   * @param profile The fetched player profile
   * @param chests The fetched player's chests
   * @param elapsed Elapsed time string for the API requests
   */
  private sketchyProfileEmbeds(profile: IApiPlayerProfile, chests: IApiPlayersUpcomingChests, elapsed: string): MessageEmbed {
    const emojiHelper: EmojiHelper = this.statsClient.emojiHelper;
    const embed: MessageEmbed = new MessageEmbed();
    EmbedHelper.setCommonAuthor(embed, profile, this.statsClient.emojiHelper.getEmojiUrlByName(profile.arena.id.toString()));
    EmbedHelper.setCommonColor(embed);
    EmbedHelper.setCommonFooter(embed, elapsed, this.client.user.displayAvatarURL());

    // Emojis
    const cardsEmoji: string = emojiHelper.getEmojiStringByName('cards');
    const trophyEmoji: string = emojiHelper.getEmojiStringByName('trophies');
    const ribbonTrophyEmoji: string = emojiHelper.getEmojiStringByName('ribbontrophy');
    const expLevelEmoji: string = emojiHelper.getEmojiStringByName('playerlevel');
    const blueCrownEmoji: string = emojiHelper.getEmojiStringByName('bluecrown');
    const redCrownEmoji: string = emojiHelper.getEmojiStringByName('redcrown');
    const doubleSwordEmoji: string = emojiHelper.getEmojiStringByName('doublesword');
    const swordEmoji: string = emojiHelper.getEmojiStringByName('sword');
    const starEmoji: string = emojiHelper.getEmojiStringByName('star');
    const medalEmoji: string = emojiHelper.getEmojiStringByName('medal');
    const wifiEmoji: string = emojiHelper.getEmojiStringByName('wifi');

    // If this player competes in seasons
    const leagueEmoji: string = emojiHelper.getEmojiStringByName(profile.arena.id.toString());
    if (profile.leagueStatistics != null) {
      const league: IApiLeagueStatistics = profile.leagueStatistics;
      // Current Season Highest
      if (league.currentSeason != null) {
        const bestTrophies: number = league.currentSeason.bestTrophies;
        if (bestTrophies != null) {
          embed.addField('Season Highest', `${leagueEmoji} ${league.currentSeason.bestTrophies}`, true);
        } else {
          embed.addField('Season Highest', `${wifiEmoji} None`, true);
        }
      }
      // Previous season
      if (league.previousSeason != null) {
        embed.addField('Previous Season', `${leagueEmoji} ${league.previousSeason.trophies}`, true);
      }
      // Best season
      if (league.bestSeason != null) {
        embed.addField('Best Season', `${leagueEmoji} ${league.bestSeason.trophies}`, true);
      }
    }

    // Current and best trophies
    embed.addField('Trophies', `${trophyEmoji} ${commaNumber(profile.trophies)}`, true);
    embed.addField('Personal Best', `${ribbonTrophyEmoji} ${commaNumber(profile.bestTrophies)} PB`, true);

    // Explevel
    embed.addField('Level', `${expLevelEmoji} ${profile.expLevel}`, true);

    // Clan
    if (profile.clan != null) {
      const clanBadgeEmoji: string = emojiHelper.getBadgeEmoji(profile.clan.badgeId);
      embed.addField(
        `${this.capitalizeFirstLetter(profile.role)} in`,
        `[${clanBadgeEmoji} ${profile.clan.name}](https://statsroyale.com/en/clan/${profile.clan.tag})`,
        true
      );
    } else {
      const noClanEmoji: string = emojiHelper.getEmojiStringByName('NoClan');
      embed.addField('Clan', `${noClanEmoji} None`, true);
    }

    // Total Clans Joined
    const socialEmoji: string = emojiHelper.getEmojiStringByName('social');
    let totalClansJoined: number = 0;
    for (const achievement of profile.achievements) {
      if (achievement.name === 'Team Player') { totalClansJoined = achievement.value; }
    }
    embed.addField('Total Clans Joined', `${socialEmoji} ${totalClansJoined}`, true);

    // Star Points
    const starPointsEmoji: string = emojiHelper.getEmojiStringByName('starpoint');
    const starPoints: number = profile.starPoints != null ? profile.starPoints : 0;
    embed.addField('Star Points', `${starPointsEmoji} ${commaNumber(starPoints)}`, true);

    // Total Donations
    embed.addField('Total Donations', `${cardsEmoji} ${commaNumber(profile.totalDonations)}`, true);

    // War Day Wins
    embed.addField('War Day Wins', `${medalEmoji} ${commaNumber(profile.warDayWins)}`, true);

    // Cards found
    embed.addField('Cards Found', `${cardsEmoji} ${commaNumber(profile.cards.length)}`, true);

    // Current favorite card
    if (profile.currentFavouriteCard != null) {
      const favoriteCardEmoji: string = emojiHelper.getCardEmojiById(profile.currentFavouriteCard.id);
      embed.addField('Favorite Card', `${favoriteCardEmoji} ${profile.currentFavouriteCard.name}`, true);
    } else {
      const upcomingCardEmoji: string = emojiHelper.getEmojiStringByName('upcomingcard');
      embed.addField('Favorite Card', `${upcomingCardEmoji} None`, true);
    }

    // Three Crown Wins
    const threeCrownEmoji: string = emojiHelper.getEmojiStringByName('threecrown');
    embed.addField('Three Crown Wins', `${threeCrownEmoji} ${commaNumber(profile.threeCrownWins)}`, true);

    // Wins / Losses / Draws / Total Battles
    const draws: number = profile.battleCount - (profile.wins + profile.losses);
    embed.addField('Total Battles', `${swordEmoji} ${commaNumber(profile.battleCount)}`, true);
    embed.addField('Wins', `${blueCrownEmoji} ${commaNumber(profile.wins)} (**${Math.floor((profile.wins / profile.battleCount) * 100)}%**)`, true);
    embed.addField('Losses', `${redCrownEmoji} ${commaNumber(profile.losses)} (**${Math.floor((profile.losses / profile.battleCount) * 100)}%**)`, true);
    embed.addField('Draws', `${doubleSwordEmoji} ${commaNumber(draws)} (**${Math.floor((draws / profile.battleCount) * 100)}%**)`, true);

    // Tournament wins
    embed.addField('Tournament Cards Won', `${cardsEmoji} ${commaNumber(profile.tournamentCardsWon)}`, true);

    // Challenge Cards
    embed.addField('Challenge Cards Won', `${cardsEmoji} ${commaNumber(profile.challengeCardsWon)}`, true);

    // Max challenge wins
    embed.addField('Challenge Max Wins', `${starEmoji} ${profile.challengeMaxWins}`, true);

    // Upcoming chest + Special Chests
    this.addUpcomingChestsFields(embed, chests);

    // Battle deck
    this.addBattleDeckField(embed, profile);

    return embed;
  }

  private capitalizeFirstLetter(inputString: string): string {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
  }

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
        if (index < 7) {
          upcomingChestsContent += `${chestEmoji}`;
        }
      } else {
        upcomingSpecialChestsContent += `${chestEmoji}${chest.index + 1}`;
      }
    });
    // embed.addBlankField(true);
    embed.addField('Upcoming Chests', upcomingChestsContent, true);
    embed.addField('Special Chests', upcomingSpecialChestsContent, true);
  }

  private addBattleDeckField(embed: MessageEmbed, profile: IApiPlayerProfile): void {
    // Some old / inactive profiles don't have a battle deck at all
    if (profile.currentDeck.length === 0) {
      return;
    }

    // Export deck URL
    let battleDeckContent: string = '';
    const battleDeckCardLinks: number[] = [];
    for (const card of profile.currentDeck) {
      const cardDetails: IStatsRoyaleCard = this.statsClient.cardHelper.getCardByName(card.name);
      // Add card decklinks to array
      battleDeckCardLinks.push(cardDetails.id);
      const cardEmoji: string = this.statsClient.emojiHelper.getCardEmojiById(cardDetails.id);
      battleDeckContent += `${cardEmoji}`;
    }
    const copyDeckEmoji: string = this.statsClient.emojiHelper.getEmojiStringByName('exportdeck');
    const copyDeckBaseUrl: string = 'https://link.clashroyale.com/deck/en?deck=';
    const copyDeckUrl: string = `${copyDeckBaseUrl}${battleDeckCardLinks.join(';')}`;

    // Canvas
    const canvas: Canvas = createCanvas(0, 0);
    const context: CanvasRenderingContext2D = canvas.getContext('2d');
    // Collect the images to draw onto the canvas
    const cardImages: Image[] = [];
    for (const card of profile.currentDeck) {
      const cardDetails: IStatsRoyaleCard = this.statsClient.cardHelper.getCardByName(card.name);
      const cardImage: Image = this.statsClient.imageHelper.getCardImageById(cardDetails.id);
      const currWidth: number = context.canvas.width;
      const currHeight: number = context.canvas.height;
      context.canvas.width = currWidth + cardImage.width;
      context.canvas.height = currHeight > cardImage.height ? currHeight : cardImage.height;
      cardImages.push(cardImage);
    }
    // Draw the images
    let xPos: number = 0;
    for (const cardImage of cardImages) {
      context.drawImage(cardImage, xPos, 0, cardImage.width, cardImage.height);
      xPos += cardImage.width;
    }

    // Attach the deck
    const attachment: MessageAttachment = new MessageAttachment(canvas.toBuffer('image/png'), 'deck.png');
    embed.attachFiles([attachment]);
    embed.addField(/*'\u200B'*/'Current Deck', `${copyDeckEmoji} [Copy](${copyDeckUrl})`);
    embed.setImage('attachment://deck.png');
  }

}
