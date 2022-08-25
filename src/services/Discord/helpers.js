import { DiscordSnowflake } from "@sapphire/snowflake";
import { parse } from "twemoji-parser";
import dayjs from "dayjs";

import TWEMOJI_REGEX from "twemoji-parser/dist/lib/regex";
import { USER_FLAGS } from "./constants/USER_FLAGS";

const MENTION_REGEX = /\<(@|@!|#|@&)\d+\>/g;
const GLOBAL_CUSTOM_EMOJI_REGEX = /<a?:\w+:\d+>/g;
const CUSTOM_EMOJI_REGEX = /<a?:(?<name>\w+):(?<id>\d+)>/;

export function hasFlag(flags, bit) {
  return (BigInt(flags) & bit) === bit;
}

export function extractUserFlags(flags) {
  return USER_FLAGS.filter(flag => hasFlag(flags, flag.value));
}

export function getMentionCount(text) {
  return text.match(MENTION_REGEX)?.length ?? 0;
}

export function getCustomEmojis(text) {
  return text.match(GLOBAL_CUSTOM_EMOJI_REGEX) ?? [];
}

export function getDefaultEmojis(text) {
  return text.match(TWEMOJI_REGEX) ?? [];
}

export function getEmojiUrl(emoji) {
  const customEmoji = emoji.match(CUSTOM_EMOJI_REGEX);
  if (customEmoji) return `https://cdn.discordapp.com/emojis/${customEmoji.groups.id}`;
  const defaultEmoji = parse(emoji)[0];
  if (defaultEmoji) return defaultEmoji.url;
}

export function getMessageUrl(guildId, channelId, messageId) {
  return `https://discord.com/channels/${guildId ?? "@me"}/${channelId}/${messageId}`;
}

export function getSnowflakeTimestamp(snowflake) {
  return dayjs(Number(DiscordSnowflake.deconstruct(snowflake).timestamp));
}