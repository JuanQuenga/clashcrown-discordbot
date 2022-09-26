import { Image } from 'canvas';
import { CardStorage, IStatsRoyaleCard } from '../storages/card-storage';
import { ImageStorage } from '../storages/image-storage';
import { AppLogger } from './app-logger';

/**
 * Image Helper
 */
export class ImageHelper {
  private logger: AppLogger = new AppLogger('ImageHelper');

  public constructor(public imageStorage: ImageStorage, public cardStorage: CardStorage) {}

  public getCardImageById(cardId: number): Image {
    // tslint:disable-next-line:no-unnecessary-local-variable
    const cardImage: Image = this.imageStorage.imageMap.get(cardId);
    // tslint:disable-next-line:no-suspicious-comment
    // TODO: Not Found Image

    return cardImage;
  }

  public getCardImageByName(cardName: string): Image {
    let card: IStatsRoyaleCard;
    this.cardStorage.cardMap.forEach((c: IStatsRoyaleCard) => {
      if (c.name === cardName) { card = c; }
    });
    const cardImage: Image = this.imageStorage.imageMap.get(card.id);
    // tslint:disable-next-line:no-suspicious-comment
    // TODO: Not Found Image

    return cardImage;
  }

}
