import { RequestAPI, RequestResponse, RequiredUriUrl } from 'request';
import requestPromise from 'request-promise';
import { IConfig } from '../config/interfaces/config.interface';
import { AppLogger } from '../util/app-logger';

/**
 * Card Storage
 */

export class CardStorage {
  public cardMap: Map<number, IStatsRoyaleCard> = new Map();
  private apiRequest: RequestAPI<requestPromise.RequestPromise, requestPromise.RequestPromiseOptions, RequiredUriUrl>;
  private logger: AppLogger;

  constructor(config: IConfig) {
    this.logger = new AppLogger('EmojiStorage');
    this.apiRequest = requestPromise.defaults({
      baseUrl: 'https://api.statsroyale.com',
      method: 'GET',
      encoding: 'utf8',
      gzip: true,
      headers: { Accept: 'application/json' },
      json: true,
      timeout: 4000,
      resolveWithFullResponse: true,
      pool: { maxSockets: Infinity }
    });
  }

  /**
   * Fetch all cards and upsert them into Map
   */
  public async fetchAvailableCards(): Promise<void> {
    this.logger.info('Fetching list of available cards');
    const cards: IStatsRoyaleCard[] = await this.requestCards();
    cards.map((c: IStatsRoyaleCard) => this.cardMap.set(c.id, c));
    this.logger.info(`Found and upserted '${cards.length}' cards into Map.`);
    this.logger.info(`Successfully fetched '${this.cardMap.size}' cards.`);
  }

  /**
   * Fetch available cards from StatsRoyale API
   */
  private async requestCards(): Promise<IStatsRoyaleCard[]> {
    const response: RequestResponse = await this.apiRequest.get('cards');

    return response.body;
  }
}

export interface IStatsRoyaleCard {
  id: number;
  name: string;
  icon: string;
  cost: number;
  rarity: 'Legendary' | 'Epic' | 'Rare' | 'Common';
  type: string; //tslint:disable-line:no-reserved-keywords
  arena: number;
  localized?: string;
 }
