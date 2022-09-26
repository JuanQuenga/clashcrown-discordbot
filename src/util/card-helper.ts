import { CardStorage, IStatsRoyaleCard } from '../storages/card-storage';
import { AppLogger } from './app-logger';

/**
 * Helper class for Cards in for ClashRoyale since API doesn't provide card ID's.
 */
export class CardHelper {
  private logger: AppLogger = new AppLogger('CardHelper');

  public constructor(public cardStorage: CardStorage) {}

  public getCardById(cardId: number): IStatsRoyaleCard {
    return this.cardStorage.cardMap.get(cardId);
  }

  public getCardByName(cardName: string): IStatsRoyaleCard {
    let card: IStatsRoyaleCard;
    for (const c of this.cardStorage.cardMap.values()) {
      if (c.name === cardName) { card = c; }
    }

    return card;
  }
}
