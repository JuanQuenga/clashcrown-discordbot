import { IConfig } from './config/interfaces/config.interface';
import { CardStorage } from './storages/card-storage';
import { EmojiStorage } from './storages/emoji-storage';
import { ImageStorage } from './storages/image-storage';
import { CRApi } from './util/api-helper';
import { CardHelper } from './util/card-helper';
import { EmojiHelper } from './util/emoji-helper';
import { ImageHelper } from './util/image-helper';

export namespace InitHelper {
  export async function init(config: IConfig): Promise<IInitObjects> {
    const emojiStorage: EmojiStorage = new EmojiStorage(config);
    const cardStorage: CardStorage = new CardStorage(config);
    await emojiStorage.fetchAvailableEmojis();
    await cardStorage.fetchAvailableCards();
    const emojiHelper: EmojiHelper = new EmojiHelper(emojiStorage, cardStorage);
    const cardHelper: CardHelper = new CardHelper(cardStorage);
    const api: CRApi = new CRApi(config.api.baseUrl, config.api.token);

    const imageStorage: ImageStorage = new ImageStorage(cardHelper, emojiHelper);
    // await imageStorage.fetchCardImages();
    const imageHelper: ImageHelper = new ImageHelper(imageStorage, cardStorage);

    return { cardHelper, emojiHelper, imageHelper, api };
  }
}

export interface IInitObjects {
  cardHelper: CardHelper;
  emojiHelper: EmojiHelper;
  imageHelper: ImageHelper;
  api: CRApi;
}
