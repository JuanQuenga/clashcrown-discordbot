import { GuildMember } from 'discord.js';
import { Gateway, KlasaMessage, Settings } from 'klasa';
import { HashtagHelper } from './hashtag-helper';

export namespace ParseHelper {
  export async function tryParseHashtag(
    message: KlasaMessage,
    hashtagArg: string
  ): Promise<string> {
    const userGateway: Gateway = message.client.gateways.users;
    const hasMentions: boolean = message.mentions.members != null && message.mentions.members.size > 0;
    let hashtag: string;

    // Check if args are empty, then we know user wants to query the saved tag
    if (hashtagArg == null && !hasMentions) {
      console.log('Searching author...');
      const userSettings: Settings = userGateway.get(message.author.id);
      hashtag = userSettings.get('hashtag');
      if (hashtag == null) { throw new Error('Unable to find a tag linked to your discord account. Please save your tag and try it again.'); }

      return hashtag;
    } else if (hasMentions) {
      console.log('Searching mention...');
      const memberMention: GuildMember = message.mentions.members.first();
      const userSettings: Settings = userGateway.get(memberMention.user.id);
      hashtag = userSettings.get('hashtag');
      if (hashtag == null) { throw new Error('Unable to find a tag linked to that discord account.'); }

      return hashtag;
    } else {
      console.log('Searching text...');
      hashtag = hashtagArg;
    }

    // Normalize and validate the hashtag
    hashtag = HashtagHelper.normalizeHashtag(hashtag);
    if (!HashtagHelper.isValidHashtag(hashtag)) {
      throw new Error(`The read hashtag '${hashtag}' is invalid`);
    }

    return hashtag;
  }
}
