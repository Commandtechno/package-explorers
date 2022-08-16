import dayjs from "dayjs";
import { Chart } from "../components/Chart";
import { Row } from "../components/Row";
import { Tile } from "../components/Tile";
import { Directory } from "../util/fs";
import {
  formatNum,
  getWords,
  getCustomEmojis,
  getDefaultEmojis,
  getEmojiUrl,
  rangeArray
} from "../util/helpers";

/** @param {{ root: Directory }} */
export async function extractMessages({ root }) {
  let totalMessages = 0;
  let totalWords = 0;
  let totalCharacters = 0;
  let totalAttachments = 0;
  let totalCustomEmojis = 0;
  let totalDefaultEmojis = 0;
  let oldest;
  let newestDate;
  let hourValues = new Map(rangeArray(24).map(i => [i, 0]));
  let monthValues = new Map();
  let wordCounts = new Map();
  let emojiCounts = new Map();

  const channelIndex = await root.file("messages/index.json", "json");
  for await (const channelDir of await root.dir("messages")) {
    if (channelDir.isDirectory) {
      for await (const message of await channelDir.file("messages.csv", "csv-with-headers")) {
        totalMessages++;
        totalCharacters += message.Contents.length;
        totalAttachments += message.Attachments.split(", ").length;

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
          const channel = await channelDir.file("channel.json", "json");
          oldest = { date, message, channel: channelIndex[channel.id] ?? channel.name };
        }
        if (!newestDate || date.isAfter(newestDate)) newestDate = date;

        const hourKey = date.hour();
        if (!hourValues.has(hourKey)) hourValues.set(hourKey, 0);
        hourValues.set(hourKey, hourValues.get(hourKey) + 1);

        const monthKey = date.format("YYYY-MM");
        if (!monthValues.has(monthKey)) monthValues.set(monthKey, 0);
        monthValues.set(monthKey, monthValues.get(monthKey) + 1);
      }
    }
  }

  const totalDays = newestDate.diff(oldest.date, "day");
  const averageMessages = Math.round(totalMessages / totalDays);

  let hourLabels = [];
  let hourData = [];
  for (const [hour, count] of hourValues.entries()) {
    hourLabels.push(dayjs().hour(hour).format("h A"));
    hourData.push(count);
  }

  let monthLabels = [];
  for (
    let currentDate = oldest.date.clone();
    currentDate.isBefore(newestDate);
    currentDate = currentDate.add(1, "month")
  )
    monthLabels.push(currentDate.format("YYYY-MM"));

  const topWords = [...wordCounts].sort((a, b) => b[1] - a[1]).slice(0, 25);
  const topEmojis = [...emojiCounts].sort((a, b) => b[1] - a[1]).slice(0, 25);

  return () => (
    <>
      <Row>
        <Tile>
          <h1>Messages</h1>
          <div>
            You've sent <b>{formatNum(totalMessages)}</b> total messages in your{" "}
            <b>{formatNum(totalDays)}</b> days here.
          </div>
          <div>
            That's an average of <b>{formatNum(averageMessages)}</b> messages a day.
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
            Your first message was <b>{oldest.message.Contents}</b> at{" "}
            <b>{oldest.date.format("MMMM D, YYYY")}</b> in <b>{oldest.channel}</b>
          </div>
        </Tile>
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
      </Row>
      <Row>
        <Tile>
          <Chart
            type="bar"
            data={{
              labels: monthLabels,
              datasets: [
                {
                  label: "Messages Per Month",
                  data: monthLabels.map(label => monthValues.get(label)),
                  backgroundColor: "#5865F2"
                }
              ]
            }}
          />
        </Tile>
        <Tile>
          <Chart
            type="bar"
            data={{
              labels: hourLabels,
              datasets: [
                {
                  label: "Messages Per Hour",
                  data: hourData,
                  backgroundColor: "#5865F2"
                }
              ]
            }}
          />
        </Tile>
      </Row>
    </>
  );
}