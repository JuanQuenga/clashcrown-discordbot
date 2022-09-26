export interface IConfig {
	discord: {
		token: string;
		prefix: string;
		ownerUserID: string;
		playing: string;
	};
	mongo: {
		host: string;
		port: number;
		database: string;
	};
	api: {
		token: string;
		baseUrl: string;
	};
}
