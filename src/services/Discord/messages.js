const { isDir, sortFrequency, read } = require("../../util");
const { readdirSync } = require("fs");
const { resolve } = require("path");

const excluded = new Set([
  "you",
  "the",
  "to",
  "it",
  "and",
  "is",
  "that",
  "for",
  "in",
  "do",
  "have",
  "so",
  "what",
  "but",
  "not",
  "we",
  "of",
  "was",
  "are",
  "im",
  "like",
  "if",
  "he",
  "with",
  "has"
]);

module.exports = async (folder, result) => {
  const channelsPath = resolve(folder, "messages");
  const channels = readdirSync(channelsPath);

  const channelsIndexPath = resolve(channelsPath, "index.json");
  const channelsIndex = read(channelsIndexPath);

  const totalEmojis = [];
  const totalServers = [];
  const totalChannels = [];
  const totalWords = [];

  let totalMessages = 0;
  let totalAttachments = 0;
  let firstMessage;

  for await (const channelId of channels) {
    const channelDir = resolve(channelsPath, channelId);
    if (isDir(channelDir)) {
      const channelPath = resolve(channelDir, "channel.json");
      const channel = read(channelPath);

      const messagesPath = resolve(channelDir, "messages.csv");
      const messages = await read(messagesPath);

      for (const message of messages) {
        totalMessages++;

        if (message.attachments) totalAttachments++;
        if (channel.guild) totalServers.push(channel.guild.id);
        totalChannels.push(channel.id);

        message._date = new Date(message.timestamp);
        message._timestamp = message._date.getTime();
        if (!firstMessage || firstMessage._timestamp > message._timestamp) {
          message._channel = channel;
          firstMessage = message;
        }

        const emojis = message.contents.match(/<:\w{2,32}:\d{17,19}>/g);
        if (emojis) {
          totalEmojis.push(...emojis);
        }

        const words = message.contents.match(/\w+/g);
        if (words)
          totalWords.push(
            ...words.filter(word => {
              if (word.length < 3) return;
              if (excluded.has(word.toLowerCase())) return;
              return true;
            })
          );
      }
    }
  }

  // Messages
  result.messages.total = totalMessages;
  result.messages.total_attachments = totalAttachments;
  if (firstMessage) {
    result.messages.first = [
      '"' + firstMessage.contents + '"',
      "Date: " + firstMessage._date.toLocaleString()
    ];

    if (firstMessage._channel.name)
      result.messages.first.push("Channel: #" + firstMessage._channel.name);

    if (firstMessage._channel.recipients?.length)
      result.messages.first.push("Users: " + firstMessage._channel.recipients.join(", "));

    if (channelsIndex[firstMessage._channel.id])
      result.messages.first.push("Name: " + channelsIndex[firstMessage._channel.id]);

    if (firstMessage._channel.guild?.name)
      result.messages.first.push("Server: " + irstMessage._channel.guild?.name);

    result.messages.first.push(
      "https://discord.com/channels/" +
        (firstMessage._channel.guild?.id ?? "@me") +
        "/" +
        firstMessage._channel.id +
        "/" +
        firstMessage.id
    );
  }

  // Emojis
  result.messages.total_emojis = totalEmojis.length;
  result.messages.favorite_emojis = sortFrequency(totalEmojis)
    .slice(0, 10)
    .map(({ element, count }) => element.split(":")[1] + " (" + count + ")");

  // Servers
  result.messages.total_servers = totalServers.length;
  result.messages.favorite_servers = sortFrequency(totalServers)
    .slice(0, 10)
    .map(({ element, count }) => element + " (" + count + ")");

  // Channels
  result.messages.total_channels = channels.length;
  result.messages.favorite_channels = sortFrequency(totalChannels)
    .slice(0, 10)
    .map(({ element, count }) => element + " (" + count + ")");

  // Words
  result.messages.total_words = totalWords.length;
  result.messages.favorite_words = sortFrequency(totalWords)
    .slice(0, 10)
    .map(({ element, count }) => element + " (" + count + ")");
};