import { Task, TaskStore } from 'klasa';
import { StatsClient } from '../client/stats-client';
import { AppLogger } from '../util/app-logger';

/**
 * Fetch Task
 *  - Fetch card data, emoji's, and images.
 */

// tslint:disable-next-line: no-default-export
export default class FetchTask extends Task {
  private statsClient: StatsClient;
  private logger: AppLogger = new AppLogger('FetchTask');

  constructor(client: StatsClient, store: TaskStore, file: string[], directory: string) {
    super(client, store, file, directory, { name: 'fetch', enabled: true });
    this.statsClient = client;
  }

  public async init(): Promise<void> {
    // TODO: Make sure schedule does not already exist
    await this.client.schedule.create('fetch', '* * * * *');
  }

  public async run(): Promise<void> {
    this.logger.info('Fetching...');
    // this.fetch();
  }

  private async fetch(): Promise<void> {
    try {
      this.logger.info('Refreshing cached data...');
      await this.statsClient.imageHelper.cardStorage.fetchAvailableCards();
      await this.statsClient.imageHelper.imageStorage.fetchCardImages();
      await this.statsClient.emojiHelper.emojiStorage.fetchAvailableEmojis();
    } catch (e){
      this.logger.error('Error when executing fetching for possible new data: ', e);
    }
  }
}
