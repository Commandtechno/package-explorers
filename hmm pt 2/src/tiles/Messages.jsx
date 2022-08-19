import dayjs from "dayjs";
import { Chart } from "../components/Chart";
import { Tile } from "../components/Tile";
import { BLURPLE } from "../constants/COLORS";
import { SHORT_DATE_TIME } from "../constants/DATE_FORMATS";
import { CustomDirectory } from "../util/fs";
import {
  formatNum,
  getWords,
  getCustomEmojis,
  getDefaultEmojis,
  getEmojiUrl,
  rangeArray,
  getMentionCount
} from "../util/helpers";

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
  let oldest;
  let newestDate;
  let hourlyValues = new Map(rangeArray(24).map(i => [i, 0]));
  let monthlyValues = new Map();
  let wordCounts = new Map();
  let emojiCounts = new Map();

  const channelIndex = await root.file("messages/index.json", "json");
  for await (const channelDir of await root.dir("messages")) {
    if (channelDir.isDirectory) {
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
          if (!wordCounts.has(word)) wordCounts.set(word, 0);
          wordCounts.set(word, wordCounts.get(word) + 1);
        }

        for (const customEmoji of getCustomEmojis(message.Contents)) {
          totalCustomEmojis++;
          if (!emojiCounts.has(customEmoji)) emojiCounts.set(customEmoji, 0);
          emojiCounts.set(customEmoji, emojiCounts.get(customEmoji) + 1);
        }

        for (const defaultEmoji of getDefaultEmojis(message.Contents)) {
          totalDefaultEmojis++;
          if (!emojiCounts.has(defaultEmoji)) emojiCounts.set(defaultEmoji, 0);
          emojiCounts.set(defaultEmoji, emojiCounts.get(defaultEmoji) + 1);
        }

        const date = dayjs(message.Timestamp);
        if (!oldest || date.isBefore(oldest.date)) {
          const channel = await channelDir.file("channel.json").then(file => file.json());
          oldest = {
            date,
            message,
            channel: channel.name ?? channelIndex[channel.id] ?? "Unknown"
          };
        }
        if (!newestDate || date.isAfter(newestDate)) newestDate = date;

        const hourlyKey = date.hour();
        if (!hourlyValues.has(hourlyKey)) hourlyValues.set(hourlyKey, 0);
        hourlyValues.set(hourlyKey, hourlyValues.get(hourlyKey) + 1);

        const monthlyKey = date.format("YYYY-MM");
        if (!monthlyValues.has(monthlyKey)) monthlyValues.set(monthlyKey, 0);
        monthlyValues.set(monthlyKey, monthlyValues.get(monthlyKey) + 1);
      }
    }
  }

  const totalDays = newestDate.diff(oldest.date, "days");
  const averageDailyMessages = Math.round(totalMessages / totalDays);

  let hourlyLabels = [];
  let hourlyData = [];
  for (const [hour, count] of hourlyValues.entries()) {
    hourlyLabels.push(dayjs().hour(hour).format("h A"));
    hourlyData.push(count);
  }

  let monthlyLabels = [];
  for (
    let currentDate = oldest.date.clone();
    currentDate.isBefore(newestDate);
    currentDate = currentDate.add(1, "month")
  )
    monthlyLabels.push(currentDate.format("YYYY-MM"));

  const topWords = [...wordCounts].sort((a, b) => b[1] - a[1]).slice(0, 25);
  const topEmojis = [...emojiCounts].sort((a, b) => b[1] - a[1]).slice(0, 25);

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
          Your first message was <b>{oldest.message.Contents}</b> on{" "}
          <b>{oldest.date.format(SHORT_DATE_TIME)}</b> in <b>{oldest.channel}</b>
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
    MessagesPerMonth: () => (
      <Tile>
        <Chart
          type="bar"
          title="Messages per month"
          data={{
            labels: monthlyLabels,
            datasets: [
              {
                data: monthlyLabels.map(label => monthlyValues.get(label)),
                backgroundColor: BLURPLE
              }
            ]
          }}
        />
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