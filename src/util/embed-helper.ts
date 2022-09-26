/**
 * Helper functions to save us writing/updating code everywhere for embeds.
 */
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { IApiPlayerProfile } from '../config/interfaces/player-profile';
import { EmojiHelper } from './emoji-helper';

export namespace EmbedHelper {
  /**
   * Sets the MessageEmbed footer.
   */
  export function setCommonFooter(embed: MessageEmbed, info: string, avatarURL: string): void {
    embed.setFooter(`ClashRoyale Statsbot - ${info}`, avatarURL);
  }

  /**
   * Sets the MessageEmbed author.
   */
  export function setCommonAuthor(embed: MessageEmbed, profile: IApiPlayerProfile, arenaIconUrl: string): void {
    embed.setAuthor(
      `${profile.name} ${profile.tag}`, // Player Username & #Tag
      arenaIconUrl, // Arena Icon
      `https://statsroyale.com/profile/${profile.tag}`
    );
  }

  /**
   * Sets the MessageEmbed color.
   */
  export function setCommonColor(embed: MessageEmbed): void {
    embed.setColor(0xe19eff);
  }

  /**
   * Adds announcement to the MessageEmbed. (if there is one)
   */
  export function setCommonAnnouncement(embed: MessageEmbed, announcement: string): void {
    if (announcement != null && announcement.length > 0) {
      embed.addField('Announcement', announcement);
    }
  }

  export async function sendWrongHashtagResponse(receivedMessage: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
    return receivedMessage.send('Invalid hashtag provided.');
  }

  export async function sendApiErrorResponse(message: KlasaMessage, statusCode: number): Promise<KlasaMessage | KlasaMessage[]> {
    switch (statusCode) {
      case 400:
        return message.send('We sent an invalid request to the Supercell API. Try again later!');
      case 404:
        return message.send('This profile does not exist!');
      case 429:
        return message.send(
          'Request was rejected because we exceeded the limit of lookups. Try again in a few seconds!'
        );
      case 500:
        return message.send(
          "An unknown server error occured on Supercell's API server! A Supercell developer has been informed."
        );
      case 503:
        return message.send("Supercell's api is under maintenace. Please try again later.");
      default:
        return message.send(`Unknown http response code ${statusCode}`);
    }
  }
}
