import { StatsClient } from './client/stats-client';
import { ConfigService } from './config/config.service';
import { InitHelper } from './init-helper';
import { AppLogger } from './util/app-logger';

const config: ConfigService = new ConfigService();
const logger: AppLogger = new AppLogger('Shard');

async function bootstrap(): Promise<void> {
  const { api, emojiHelper, cardHelper, imageHelper } = await InitHelper.init(config);
  const client: StatsClient = new StatsClient(config, api, emojiHelper, cardHelper, imageHelper);
  // tslint:disable-next-line: no-void-expression
  client.login(config.discord.token).catch((err: Error) => logger.error('Error logging in: ', err));
  client.on('disconnect', () => process.exit(100));
}

/*const errRegex: RegExp = /ETIMEDOUT|getaddrinfo|Something took too long to do/;
process.on('unhandledRejection', (reason: Error | string) => {
  logger.error('Received unhandled rejection in shard', reason);
  process.exit(200);
});*/

bootstrap();
