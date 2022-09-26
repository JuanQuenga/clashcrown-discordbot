import { CloseEvent, Guild } from 'discord.js';
import { KlasaClient } from 'klasa';
import { IConfig } from '../config/interfaces/config.interface';
import { CRApi } from '../util/api-helper';
import { AppLogger } from '../util/app-logger';
import { CardHelper } from '../util/card-helper';
import { EmojiHelper } from '../util/emoji-helper';
import { ImageHelper } from '../util/image-helper';
import { permissionLevels } from './permissions';
// Test

/**
 * Stats Client (AkairoClient)
 */

export class StatsClient extends KlasaClient {
  private logger: AppLogger = new AppLogger('StatsClient');

  constructor(
    public config: IConfig,
    public crApi: CRApi,
    public emojiHelper: EmojiHelper,
    public cardHelper: CardHelper,
    public imageHelper: ImageHelper) {

    super({
      ownerID: '228781414986809344',
      prefix: '!',
      noPrefixDM: true,
      permissionLevels: permissionLevels,
      production: true,
      providers: { default: 'mongodb', 'mongodb': {
				connectionString: `mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.database}`
			}},
      readyMessage: 'Stats Client is ready!',
      slowmode: 3000, // 3 second cooldown
      typing: true
    });

    this.gateways.users.schema
      .add('hashtag', 'String')
      .add('verified', 'Boolean');
    this.gateways.guilds.schema.add('channels', 'String', { array: true });

    this.on('ready', this.onReady);
    this.on('warn', this.onDiscordWarning);
    this.on('error', this.onDiscordError);
    this.on('shardDisconnect', this.onDisconnect);
    this.on('shardReconnecting', this.onReconnecting);
    this.on('guildUnavailable', this.onGuildUnavailable);
    this.on('shardReady', () => this.logger.info('Shard Ready'));
  }

  private async onReady(): Promise<void> {
    this.user.setPresence({ activity: { name: this.config.discord.playing } });
		this.logger.info(`${this.guilds.cache.size} guild(s) are in cache.`);
  }

  private onDisconnect(event: CloseEvent, id: number): void {
    this.logger.warn(`Shard with ID '${id}' has been disconnected.`);
  }

  private onReconnecting(id: number): void {
    this.logger.warn(`Shard with ID '${id}' is reconnecting.`);
  }

  private onGuildUnavailable(guild: Guild): void {
    this.logger.info(`Guild ${guild.name} is currently unavailable`);
  }

  private onDiscordWarning(info: {}): void {
    this.logger.warn('Discord warning: ', info);
  }

  private onDiscordError(e: Error): void {
    this.logger.warn('Discord error: ', e.message);
  }
}
