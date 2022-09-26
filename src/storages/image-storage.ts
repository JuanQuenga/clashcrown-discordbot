import { Image, loadImage } from 'canvas';
import { AppLogger } from '../util/app-logger';
import { CardHelper } from '../util/card-helper';
import { EmojiHelper } from '../util/emoji-helper';

/**
 * Image Storage
 */

export class ImageStorage {
  public imageMap: Map<number, Image> = new Map();
  private logger: AppLogger = new AppLogger('ImageStorage');

  constructor(private cardHelper: CardHelper, private emojiHelper: EmojiHelper) {}

  /**
   * Fetch all card images
   */
  public async fetchCardImages(): Promise<void> {
    this.logger.info(`Fetching '${this.cardHelper.cardStorage.cardMap.size}' images...`);
    for (const card of this.cardHelper.cardStorage.cardMap.values()) {
      const imageUrl: string = this.emojiHelper.getCardEmojiUrlByName(card.name);
      let cardImage: Image;
      if (!imageUrl) {
        this.logger.info(`Card image for '${card.name}' was not found.`);
        cardImage = await loadImage('https://cdn.discordapp.com/emojis/306612279103717387.png');
      }
      cardImage = await loadImage(imageUrl);
      this.imageMap.set(card.id, cardImage);
    }
    this.logger.info(`Successfully cached '${this.imageMap.size}' images.`);
  }

}
