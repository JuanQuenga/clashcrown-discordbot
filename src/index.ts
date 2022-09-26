import * as Joi from '@hapi/joi';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { StatsClient } from './client/stats-client';
import { InitHelper } from './init-helper';
import { AppLogger } from './util/app-logger';

const logger: AppLogger = new AppLogger('Main');

// Validate Config
const configFile: string = fs.readFileSync('./config.yaml', 'utf8');
const config: {} = yaml.safeLoad(configFile);
const configSchema: Joi.ObjectSchema = Joi.object({
	discord: Joi.object({
		token: Joi.string().required(),
		prefix: Joi.string().default('!'),
		ownerUserID: Joi.string().required(),
		playing: Joi.string().required()
	}),
	mongo: Joi.object({
		host: Joi.string().default('localhost'),
		port: Joi.number().default(27017),
		database: Joi.string().default('reports_client')
  }),
  api: Joi.object({
    token: Joi.string().required(),
    baseUrl: Joi.string().required()
  })
}).unknown();
const { error, value: validatedConfig } = configSchema.validate(config);
if (error) { throw new Error(`Config validation error: ${error.message}`); }


async function bootstrap(): Promise<void> {
  logger.info('Starting to initialize the bot');
  logger.info(`${Date.now()}`);

  const { api, emojiHelper, cardHelper, imageHelper } = await InitHelper.init(validatedConfig);
  const client: StatsClient = new StatsClient(validatedConfig, api, emojiHelper, cardHelper, imageHelper);
  // tslint:disable-next-line: no-void-expression
  client.login(validatedConfig.discord.token).catch((err: Error) => logger.error('Error logging in: ', err));
}

bootstrap();
