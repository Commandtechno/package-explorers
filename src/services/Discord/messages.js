const { isDir, sortFrequency, read, parseEmoji } = require("../../util");
const { readdirSync } = require("fs");
const { resolve } = require("path");

const { excluded, hours, months, years } = require("./constants");

module.exports = async (folder, result) => {
  const channelsPath = resolve(folder, "messages");
  const channels = readdirSync(channelsPath);

  const channelsIndexPath = resolve(channelsPath, "index.json");
  const channelsIndex = read(channelsIndexPath);

  const totalEmojis = [];
  const totalServers = [];
  const totalChannels = [];
  const totalWords = [];

  const perHour = Object.fromEntries(hours.map(hour => [hour, 0]));
  const perMonth = Object.fromEntries(months.map(month => [month, 0]));
  const perYear = Object.fromEntries(years.map(year => [year, 0]));

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

        message._date = new Date(message.timestamp);
        message._timestamp = message._date.getTime();

        perHour[hours[message._date.getHours()]]++;
        perMonth[months[message._date.getMonth()]]++;
        perYear[message._date.getFullYear()]++;

        if (message.attachments) totalAttachments++;
        if (channel.guild) totalServers.push(channel.guild.name + " (" + channel.guild.id + ")");

        let channelName;
        if (channel.name) channelName = "#" + channel.name;
        else channelName = channelsIndex[channel.id];
        if (channelName) totalChannels.push(channelName + " (" + channel.id + ")");

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
    result.messages.first = {};
    result.messages.first.text = '"' + firstMessage.contents + '"';
    result.messages.first.date = firstMessage._date.toLocaleString();

    if (firstMessage._channel.name)
      result.messages.first.channel = "#" + firstMessage._channel.name;

    if (firstMessage._channel.recipients?.length)
      result.messages.first.users = firstMessage._channel.recipients.join(", ");

    if (channelsIndex[firstMessage._channel.id])
      result.messages.first.name = channelsIndex[firstMessage._channel.id];

    if (firstMessage._channel.guild?.name)
      result.messages.first.server = firstMessage._channel.guild?.name;

    result.messages.first.url =
      "https://discord.com/channels/" +
      (firstMessage._channel.guild?.id ?? "@me") +
      "/" +
      firstMessage._channel.id +
      "/" +
      firstMessage.id;
  }

  // Per
  result.messages.per_hour = perHour;
  result.messages.per_month = perMonth;
  result.messages.per_year = perYear;

  // Emojis
  result.messages.total_emojis = totalEmojis.length;
  result.messages.favorite_emojis = sortFrequency(totalEmojis)
    .slice(0, 10)
    .map(({ element, count }) => parseEmoji(element) + " (" + count.toLocaleString() + ")");

  // Servers
  result.messages.total_servers = totalServers.length;
  result.messages.favorite_servers = sortFrequency(totalServers)
    .slice(0, 10)
    .map(({ element, count }) => element + " (" + count.toLocaleString() + ")");

  // Channels
  result.messages.total_channels = channels.length;
  result.messages.favorite_channels = sortFrequency(totalChannels)
    .slice(0, 10)
    .map(({ element, count }) => element + " (" + count.toLocaleString() + ")");

  // Words
  result.messages.total_words = totalWords.length;
  result.messages.favorite_words = sortFrequency(totalWords)
    .slice(0, 10)
    .map(({ element, count }) => element + " (" + count.toLocaleString() + ")");
};