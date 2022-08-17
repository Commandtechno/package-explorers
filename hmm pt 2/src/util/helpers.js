import { parse } from "twemoji-parser";
import TWEMOJI_REGEX from "twemoji-parser/dist/lib/regex";
import { STOP_WORDS } from "./stopWords";
import { DiscordSnowflake } from "@sapphire/snowflake";
import dayjs from "dayjs";

const GLOBAL_CUSTOM_EMOJI_REGEX = /<a?:\w+:\d+>/g;
const CUSTOM_EMOJI_REGEX = /<a?:(?<name>\w+):(?<id>\d+)>/;
const WORD_REGEX = /(?<=\s|^)\w+(?=\s|$)/g;

export function rangeArray(start, end) {
  if (!end) {
    end = start;
    start = 0;
  }

  return Array.from({ length: end - start }, (_, i) => i + start);
}

export function formatNum(num) {
  return num.toLocaleString();
}

export function getCustomEmojis(text) {
  return text.match(GLOBAL_CUSTOM_EMOJI_REGEX) ?? [];
}

export function getDefaultEmojis(text) {
  return text.match(TWEMOJI_REGEX) ?? [];
}

export function getWords(text) {
  return (text.match(WORD_REGEX) ?? [])
    .map(word => word.toLowerCase())
    .filter(word => !STOP_WORDS.has(word));
}

export function getEmojiUrl(emoji) {
  const customEmoji = emoji.match(CUSTOM_EMOJI_REGEX);
  if (customEmoji) return `https://cdn.discordapp.com/emojis/${customEmoji.groups.id}`;
  const defaultEmoji = parse(emoji)[0];
  if (defaultEmoji) return defaultEmoji.url;
}

export function getSnowflakeTimestamp(snowflake) {
  return dayjs(Number(DiscordSnowflake.deconstruct(snowflake).timestamp));
}