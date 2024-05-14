import { USER_FLAGS } from "./constants/USER_FLAGS.macro";
import { parse } from "@twemoji/parser";
import regexPkg from "@twemoji/parser/dist/lib/regex.js";
import dayjs from "dayjs";

const DISCORD_EPOCH = 1420070400000n;
const MENTION_REGEX = /\<(@|@!|#|@&)\d+\>/g;
const GLOBAL_CUSTOM_EMOJI_REGEX = /<a?:\w+:\d+>/g;
const CUSTOM_EMOJI_REGEX = /<a?:(?<name>\w+):(?<id>\d+)>/;
const TWEMOJI_REGEX = regexPkg.default ?? regexPkg;

export const hasFlag = (flags, bit) => (BigInt(flags) & bit) === bit;
export const extractUserFlags = flags => USER_FLAGS.filter(flag => hasFlag(flags, flag.value));

export const getAttachmentCount = attachments => (attachments ? attachments.split(" ").length : 0);
export const getMentionCount = text => text.match(MENTION_REGEX)?.length ?? 0;
export const getCustomEmojis = text => text.match(GLOBAL_CUSTOM_EMOJI_REGEX) ?? [];
export const getDefaultEmojis = text => text.match(TWEMOJI_REGEX) ?? [];

export const getMessageUrl = (guildId, channelId, messageId) =>
  `https://discord.com/channels/${guildId ?? "@me"}/${channelId}/${messageId}`;

export function getSnowflakeTimestamp(snowflake) {
  const ms = BigInt(snowflake) >> 22n;
  const unix = ms + DISCORD_EPOCH;
  return dayjs(Number(unix));
}

export function getEmojiUrl(emoji) {
  const customEmoji = emoji.match(CUSTOM_EMOJI_REGEX);
  if (customEmoji) return `https://cdn.discordapp.com/emojis/${customEmoji.groups.id}`;
  const defaultEmoji = parse(emoji)[0];
  if (defaultEmoji) return defaultEmoji.url;
}
