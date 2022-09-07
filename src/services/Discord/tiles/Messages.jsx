import dayjs from "dayjs";
import { Chart } from "@common/components/Chart";
import { Tile } from "@common/components/Tile";
import { BLURPLE } from "../constants/COLORS";
import { SHORT_DATE_TIME } from "@common/constants/DATE_FORMATS";
import { ChannelTypes } from "../enums/ChannelTypes";
import { Counter } from "@common/util/counter";
import { BaseDirectory } from "@common/util/fs";
import { formatHour, formatNum, getWords, rangeNum, rangeDate } from "@common/util/helpers";
import {
  getCustomEmojis,
  getDefaultEmojis,
  getEmojiUrl,
  getMentionCount,
  getMessageUrl
} from "../helpers";
import { Link } from "@common/components/Link";

/** @param {{ root: BaseDirectory, totalReactions: number, totalMessagesEdited: number, totalMessagesDeleted: number }} */
export async function extractMessages({
  root,
  totalReactions,
  totalMessagesEdited,
  totalMessagesDeleted
}) {
  let totalMessages = 0;
  let totalWords = 0;
  let totalCharacters = 0;
  let totalAttachments = 0;
  let totalMentions = 0;
  let totalCustomEmojis = 0;
  let totalDefaultEmojis = 0;
  let oldestMessage;
  let newestMessageDate;
  let hourlyMessageCounter = new Counter(rangeNum(24, i => [i, 0]));
  let monthlyMessageCounter = new Counter();
  let wordCounter = new Counter();
  let emojiCounter = new Counter();
  let dmMessageCounter = new Counter();
  let channelMessageCounter = new Counter();
  let guildMessageCounter = new Counter();

  const channelNames = await root
    .getFile("messages/index.json")
    .then(res => res.json())
    .then(res => new Map(Object.entries(res)));
  const guildNames = new Map();

  for await (const channelDir of await root.getDir("messages")) {
    if (channelDir.isDirectory) {
      const channel = await channelDir.getFile("channel.json").then(file => file.json());
      if (!channelNames.has(channel.id)) channelNames.set(channel.id, channel.name);
      if (channel.guild) guildNames.set(channel.guild.id, channel.guild.name);

      /** @type {AsyncGenerator<import("../util/types").Message>} */
      const messages = await channelDir
        .getFile("messages.csv")
        .then(file => file.csv({ withHeaders: true }));

      for await (const message of messages) {
        totalMessages++;
        totalCharacters += message.Contents.length;
        totalAttachments += message.Attachments.split(" ").length;
        totalMentions += getMentionCount(message.Contents);

        for (const word of getWords(message.Contents)) {
          totalWords++;
          wordCounter.incr(word);
        }

        for (const customEmoji of getCustomEmojis(message.Contents)) {
          totalCustomEmojis++;
          emojiCounter.incr(customEmoji);
        }

        for (const defaultEmoji of getDefaultEmojis(message.Contents)) {
          totalDefaultEmojis++;
          emojiCounter.incr(defaultEmoji);
        }

        if (channel.type === ChannelTypes.DM || channel.type === ChannelTypes.GROUP_DM) dmMessageCounter.incr(channel.id);
        else channelMessageCounter.incr(channel.id);
        if (channel.guild) guildMessageCounter.incr(channel.guild.id);

        const date = dayjs(message.Timestamp);
        if (!oldestMessage || date.isBefore(oldestMessage.date))
          oldestMessage = {
            date,
            message,
            guild_id: channel.guild?.id,
            channel_id: channel.id
          };
        if (!newestMessageDate || date.isAfter(newestMessageDate)) newestMessageDate = date;

        hourlyMessageCounter.incr(date.hour());
        monthlyMessageCounter.incr(date.format("YYYY-MM"));
      }
    }
  }

  const totalDays = newestMessageDate.diff(oldestMessage.date, "days");
  const averageDailyMessages = Math.round(totalMessages / totalDays);

  const topWords = wordCounter.sort().slice(0, 25);
  const topEmojis = emojiCounter.sort().slice(0, 25);

  const topDms = dmMessageCounter.sort().slice(0, 100);
  const topChannels = channelMessageCounter.sort().slice(0, 100);
  const topGuilds = guildMessageCounter.sort().slice(0, 100);

  const hourlyMessageLabels = hourlyMessageCounter.map(([hour]) => hour);
  const monthlyMessageLabels = rangeDate(oldestMessage.date, newestMessageDate, "month").map(date => date.format("YYYY-MM"));

  return {
    Messages: () =>
      <Tile>
        <h1>Messages</h1>
        <div>You've sent <b>{formatNum(totalMessages)}</b> total messages in your <b>{formatNum(totalDays)}</b> days here.</div>
        <div>That's an average of <b>{formatNum(averageDailyMessages)}</b> messages a day.</div>
        <div>That's a total of <b>{formatNum(totalWords)}</b> words.</div>
        <div>That's a total of <b>{formatNum(totalCharacters)}</b> characters.</div>
        <div>Text wasn't enough? You sent <b>{formatNum(totalAttachments)}</b> files.</div>
        <div>Like emojis? You used <b>{formatNum(totalCustomEmojis)}</b> custom emojis and <b>{formatNum(totalDefaultEmojis)}</b> default emojis.</div>
        <div>Overall, you pinged <b>{formatNum(totalMentions)}</b> users, roles, and channels</div>
        <div>Whoops, you edited <b>{formatNum(totalMessagesEdited)}</b> messages and deleted <b>{formatNum(totalMessagesDeleted)}</b> messages.</div>
        <div>You added <b>{formatNum(totalReactions)}</b> reactions to messages.</div>
        <div>Your first message was <b><Link href={getMessageUrl(
          oldestMessage.guild_id,
          oldestMessage.channel_id,
          oldestMessage.message.ID
        )}>{oldestMessage.message.Contents}</Link></b> on <b>{oldestMessage.date.format(SHORT_DATE_TIME)}</b> in <b>{channelNames.get(oldestMessage.channel_id) ?? "Unknown"}</b>
        </div>
      </Tile>,
    TopWords: () =>
      <Tile>
        <h1>Top {topWords.length} words</h1>
        <table>
          <tbody>
            {topWords.map(([word, count], index) => (
              <tr>
                <td>{index + 1}. {word}</td>
                <td>{formatNum(count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>,
    TopEmojis: () =>
      <Tile>
        <h1>Top {topEmojis.length} emojis</h1>
        <table>
          <tbody>
            {topEmojis.map(([emoji, count], index) => (
              <tr>
                <td>{index + 1}. <img className="emoji" src={getEmojiUrl(emoji)} /></td>
                <td>{formatNum(count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>,
    TopDms: () =>
      <Tile>
        <h1>Top {topDms.length} DMs</h1>
        <table>
          <tbody>
            {topDms.map(([dmId, count], index) => (
              <tr>
                <td>{index + 1}. {channelNames.get(dmId) ?? 'Unknown'}</td>
                <td>{formatNum(count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>,
    TopChannels: () =>
      <Tile>
        <h1>Top {topChannels.length} channels</h1>
        <table>
          <tbody>
            {topChannels.map(([channelId, count], index) => (
              <tr>
                <td>{index + 1}. {channelNames.get(channelId) ?? 'Unknown'}</td>
                <td>{formatNum(count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>,
    TopGuilds: () =>
      <Tile>
        <h1>Top {topGuilds.length} guilds</h1>
        <table>
          <tbody>
            {topGuilds.map(([guildId, count], index) => (
              <tr>
                <td>{index + 1}. {guildNames.get(guildId)}</td>
                <td>{formatNum(count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>,
    MessagesPerMonth: () =>
      <Tile>
        <Chart
          type="line"
          title="Messages per month"
          data={{
            labels: monthlyMessageLabels,
            datasets: [
              {
                data: monthlyMessageLabels.map(label => monthlyMessageCounter.get(label)),
                borderColor: BLURPLE,
                backgroundColor: BLURPLE
              }
            ]
          }}
        />
      </Tile>,
    MessagesPerHour: () =>
      <Tile>
        <Chart
          type="line"
          title="Messages per hour"
          data={{
            labels: hourlyMessageLabels,
            datasets: [{
              data: hourlyMessageLabels.map(hour => hourlyMessageCounter.get(hour)),
              borderColor: BLURPLE,
              backgroundColor: BLURPLE
            }]
          }}
          options={{
            scales: { x: { ticks: { callback: formatHour } } }
          }}
        />
      </Tile>
  };
}