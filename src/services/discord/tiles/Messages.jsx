import dayjs from "dayjs";
import { Chart } from "@common/components/Chart";
import { Tile } from "@common/components/Tile";
import { BLURPLE } from "../constants/COLORS";
import { SHORT_DATE_TIME } from "@common/constants/DATE_FORMATS";
import { ChannelTypes } from "../enums/ChannelTypes";
import { Counter } from "@common/util/counter";
import { CustomDirectory } from "@common/util/fs";
import { formatNum, getWords, rangeArray } from "@common/util/helpers";
import {
  getCustomEmojis,
  getDefaultEmojis,
  getEmojiUrl,
  getMentionCount,
  getMessageUrl
} from "../helpers";
import { Test } from "@common/components/ApexChart";

/** @param {{ root: CustomDirectory, totalReactions: number, totalMessagesEdited: number, totalMessagesDeleted: number }} */
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
  let newestDate;
  let hourlyCounter = new Counter(rangeArray(24).map(i => [i, 0]));
  let monthlyCounter = new Counter();
  let wordCounter = new Counter();
  let emojiCounter = new Counter();
  let dmMessageCounter = new Counter();
  let channelMessageCounter = new Counter();
  let guildMessageCounter = new Counter();

  const channelNames = await root
    .file("messages/index.json")
    .then(res => res.json())
    .then(res => new Map(Object.entries(res)));
  const guildNames = new Map();

  for await (const channelDir of await root.dir("messages")) {
    if (channelDir.isDirectory) {
      const channel = await channelDir.file("channel.json").then(file => file.json());
      if (!channelNames.has(channel.id)) channelNames.set(channel.id, channel.name);
      if (channel.guild) guildNames.set(channel.guild.id, channel.guild.name);

      /** @type {AsyncGenerator<import("../util/types").Message>} */
      const messages = await channelDir
        .file("messages.csv")
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

        if (channel.type === ChannelTypes.DM || channel.type === ChannelTypes.GROUP_DM)
          dmMessageCounter.incr(channel.id);
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
        if (!newestDate || date.isAfter(newestDate)) newestDate = date;

        hourlyCounter.incr(date.hour());
        monthlyCounter.incr(date.format("YYYY-MM"));
      }
    }
  }

  const totalDays = newestDate.diff(oldestMessage.date, "days");
  const averageDailyMessages = Math.round(totalMessages / totalDays);

  const topWords = wordCounter.sort().slice(0, 25);
  const topEmojis = emojiCounter.sort().slice(0, 25);

  const topDms = dmMessageCounter.sort().slice(0, 100);
  const topChannels = channelMessageCounter.sort().slice(0, 100);
  const topGuilds = guildMessageCounter.sort().slice(0, 100);

  let hourlyLabels = [];
  let hourlyData = [];
  for (const [hour, count] of hourlyCounter) {
    hourlyLabels.push(dayjs().hour(hour).format("h A"));
    hourlyData.push(count);
  }

  let monthlyLabels = [];
  for (
    let currentDate = oldestMessage.date.clone();
    currentDate.isBefore(newestDate);
    currentDate = currentDate.add(1, "month")
  )
    monthlyLabels.push(currentDate.format("YYYY-MM"));

  return {
    Messages: () => (
      <Tile>
        <h1>Messages</h1>
        <div>
          You've sent <b>{formatNum(totalMessages)}</b> total messages in your{" "}
          <b>{formatNum(totalDays)}</b> days here.
        </div>
        <div>
          That's an average of <b>{formatNum(averageDailyMessages)}</b> messages a day.
        </div>
        <div>
          That's a total of <b>{formatNum(totalWords)}</b> words.
        </div>
        <div>
          That's a total of <b>{formatNum(totalCharacters)}</b> characters.
        </div>
        <div>
          Text wasn't enough? You sent <b>{formatNum(totalAttachments)}</b> files.
        </div>
        <div>
          Like emojis? You used <b>{formatNum(totalCustomEmojis)}</b> custom emojis and{" "}
          <b>{formatNum(totalDefaultEmojis)}</b> default emojis.
        </div>
        <div>
          Overall, you pinged <b>{formatNum(totalMentions)}</b> users, roles, and channels
        </div>
        <div>
          Whoops, you edited <b>{formatNum(totalMessagesEdited)}</b> messages and deleted{" "}
          <b>{formatNum(totalMessagesDeleted)}</b> messages.
        </div>
        <div>
          You added <b>{formatNum(totalReactions)}</b> reactions to messages.
        </div>
        <div>
          Your first message was{" "}
          <b>
            <a
              href={getMessageUrl(
                oldestMessage.guild_id,
                oldestMessage.channel_id,
                oldestMessage.message.ID
              )}
            >
              {oldestMessage.message.Contents}
            </a>
          </b>{" "}
          on <b>{oldestMessage.date.format(SHORT_DATE_TIME)}</b> in{" "}
          <b>{channelNames.get(oldestMessage.channel_id) ?? "Unknown"}</b>
        </div>
      </Tile>
    ),
    TopWords: () => (
      <Tile>
        <h1>Top {topWords.length} words</h1>
        <table>
          <tbody>
            {topWords.map(([word, count], index) => (
              <tr>
                <td>
                  {index + 1}. {word}
                </td>
                <td className="end">{formatNum(count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>
    ),
    TopEmojis: () => (
      <Tile>
        <h1>Top {topEmojis.length} emojis</h1>
        <table>
          <tbody>
            {topEmojis.map(([emoji, count], index) => (
              <tr>
                <td>
                  {index + 1}. <img className="emoji" src={getEmojiUrl(emoji)} />
                </td>
                <td className="end">{formatNum(count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>
    ),
    TopDms: () => (
      <Tile>
        <h1>Top {topDms.length} DMs</h1>
        <table>
          <tbody>
            {topDms.map(([dmId, count], index) => (
              <tr>
                <td>
                  {index + 1}. {channelNames.get(dmId)}
                </td>
                <td className="end">{formatNum(count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>
    ),
    TopChannels: () => (
      <Tile>
        <h1>Top {topChannels.length} Channels</h1>
        <table>
          <tbody>
            {topChannels.map(([channelId, count], index) => (
              <tr>
                <td>
                  {index + 1}. {channelNames.get(channelId)}
                </td>
                <td className="end">{formatNum(count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>
    ),
    TopGuilds: () => (
      <Tile>
        <h1>Top {topGuilds.length} Guilds</h1>
        <table>
          <tbody>
            {topGuilds.map(([guildId, count], index) => (
              <tr>
                <td>
                  {index + 1}. {guildNames.get(guildId)}
                </td>
                <td className="end">{formatNum(count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>
    ),
    MessagesPerMonth: () => (
      <Tile>
        <Chart
          type="bar"
          title="Messages per month"
          data={{
            labels: monthlyLabels,
            datasets: [
              {
                data: monthlyLabels.map(label => monthlyCounter.get(label)),
                backgroundColor: BLURPLE
              }
            ]
          }}
        />
        {/* <h1>Messages per month</h1>
        <Test
          series={[
            {
              name: "Messages",
              data: monthlyLabels.map(label => ({ x: label, y: monthlyCounter.get(label) }))
            }
          ]}
          chart={{
            type: "bar",
            height: 200
          }}
        ></Test> */}
      </Tile>
    ),
    MessagesPerHour: () => (
      <Tile>
        <Chart
          type="bar"
          title="Messages per hour"
          data={{
            labels: hourlyLabels,
            datasets: [{ data: hourlyData, backgroundColor: BLURPLE }]
          }}
        />
      </Tile>
    )
  };
}