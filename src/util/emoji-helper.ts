import { Emoji } from 'discord.js';
import { CardStorage, IStatsRoyaleCard } from '../storages/card-storage';
import { EmojiStorage } from '../storages/emoji-storage';
import { AppLogger } from './app-logger';

/**
 * Helper class for Emojis in Discord
 */
export class EmojiHelper {
  private logger: AppLogger = new AppLogger('EmojiHelper');

  public constructor(public emojiStorage: EmojiStorage, private cardStorage: CardStorage) {}

  public getEmojiUrlByName(emojiName: string): string {
    const emoji: Emoji = this.emojiStorage.emojiMap.get(emojiName);
    if (!emoji) {
      this.logger.error(`Failed to lookup emoji by emojiName '${emojiName}'`);

      return '[N/A]';
    } else {
      return `https://cdn.discordapp.com/emojis/${emoji.id}.png`;
    }
  }

  public getEmojiStringByName(emojiName: string): string {
    try {
      const emojiObj: Emoji = this.emojiStorage.emojiMap.get(emojiName);

      return `<:${emojiObj.name}:${emojiObj.id}>`;
    } catch (err) {
      this.logger.error(`Failed to lookup emoji by emojiName '${emojiName}'`, err);

      return '[N/A]';
    }
  }

  /**
   * Returns the emoji string for the given badge id.
   * @param badgeId Sueprcell's badge id (e. g. 16000000)
   */
  public getBadgeEmoji(badgeId: number): string {
    return this.getEmojiStringByName(badgeId.toString());
  }

  public getCardEmojiById(cardId: number): string {
    const card: IStatsRoyaleCard = this.cardStorage.cardMap.get(cardId);
    const cardEmoji: string = this.getEmojiStringByName(card.icon);
    if (cardEmoji === '[N/A]') {
      return this.getEmojiStringByName('upcomingcard');
    }

    return cardEmoji;
  }

  public getCardEmojiByName(cardName: string): string {
    let card: IStatsRoyaleCard;
    this.cardStorage.cardMap.forEach((c: IStatsRoyaleCard) => {
      if (c.name === cardName) { card = c; }
    });
    const cardEmoji: string = this.getEmojiStringByName(card.icon);
    if (cardEmoji === '[N/A]') {
      return this.getEmojiStringByName('upcomingcard');
    }

    return cardEmoji;
  }

  public getChestEmojiByName(chestName: string): string {
    const chestEmojiName: string = chestName
      .toLowerCase()
      .replace(/\s/g, '') // Remove all whitespaces
      .replace('goldenchest', 'goldchest');

    return this.getEmojiStringByName(chestEmojiName);
  }

  public getCardEmojiUrlById(cardId: number): string {
    const card: IStatsRoyaleCard = this.cardStorage.cardMap.get(cardId);
    const emojiUrl: string = this.getEmojiUrlByName(card.icon);
    if (emojiUrl === '[N/A]') {
      return this.getEmojiUrlByName('upcomingcard');
    }

    return emojiUrl;
  }

  public getCardEmojiUrlByName(cardName: string): string {
    let card: IStatsRoyaleCard;
    this.cardStorage.cardMap.forEach((c: IStatsRoyaleCard) => {
      if (c.name === cardName) { card = c; }
    });
    const emojiUrl: string = this.getEmojiUrlByName(card.icon);
    if ( emojiUrl === '[N/A]') {
      return this.getEmojiUrlByName('upcomingcard');
    }

    return emojiUrl;
  }
}
