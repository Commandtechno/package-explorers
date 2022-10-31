import dayjs from "dayjs";

import { Chart } from "@common/components/Chart";
import { Tile } from "@common/components/Tile";
import { Counter } from "@common/util/counter";
import { BaseDirectory } from "@common/util/fs";
import { formatHour, formatNum, rangeDate, rangeNum } from "@common/util/helpers";

import { accentColor } from "..";
import { SHORT_DATE_TIME } from "@common/constants/DATE_FORMATS";


/** @param {{ root: BaseDirectory }} */
export async function extractStreaming({ root }) {
  let totalListeningTime = 0
  let hourlyListeningCounter = new Counter(rangeNum(24, i => [i, 0]));
  let monthlyListeningCounter = new Counter();
  let trackCounter = new Counter();
  let artistCounter = new Counter();

  const streamingHistory = await root.getFile('StreamingHistory0.json').then(res => res.json())
  for (const track of streamingHistory) {
    totalListeningTime += track.msPlayed
    const endTime = dayjs(track.endTime)
    hourlyListeningCounter.incr(endTime.hour(), track.msPlayed);
    monthlyListeningCounter.incr(endTime.format('YYYY-MM'), track.msPlayed);
    if (track.trackName !== 'Unknown Track' && track.artistName !== 'Unknown Artist') {
      trackCounter.incr(track.trackName, track.msPlayed);
      artistCounter.incr(track.artistName, track.msPlayed);
    }
  }

  const [firstTrack] = streamingHistory
  const startTime = dayjs(firstTrack.endTime).subtract(dayjs.duration(firstTrack.msPlayed, 'milliseconds'))

  const topTracks = trackCounter.sort().slice(0, 25)
  const topArtists = artistCounter.sort().slice(0, 25)

  const monthlyListeningLabels = rangeDate(
    dayjs(streamingHistory[0].endTime),
    dayjs(streamingHistory[streamingHistory.length - 1].endTime), "month"
  ).map(date => date.format("YYYY-MM"))

  return {
    Streaming: () =>
      <Tile size="2">
        <h1>Streaming</h1>
        <p>You've streamed a total of <b>{formatNum(Math.round(dayjs.duration(totalListeningTime, 'milliseconds').asMinutes()))}</b> minutes of music since <b>{startTime.format('MMMM YYYY')}</b></p>
      </Tile>,
    TopTracks: () =>
      <Tile>
        <h1>Top {topTracks.length} tracks</h1>
        <table>
          <tbody>{
            topTracks.map(([track, count]) =>
              <tr>
                <td>{track}</td>
                <td>{dayjs.duration(count, 'milliseconds').humanize()}</td>
              </tr>)}
          </tbody>
        </table>
      </Tile>,
    TopArtists: () =>
      <Tile>
        <h1>Top {topArtists.length} artists</h1>
        <table>
          <tbody>{
            topArtists.map(([artist, count]) =>
              <tr>
                <td>{artist}</td>
                <td>{dayjs.duration(count, 'milliseconds').humanize()}</td>
              </tr>)}
          </tbody>
        </table>
      </Tile>,
    ListeningPerMonth: () =>
      <Tile>
        <Chart
          type="line"
          title="Listening per month"
          data={{
            labels: monthlyListeningLabels,
            datasets: [
              {
                data: monthlyListeningLabels.map(label => monthlyListeningCounter.get(label)),
                borderColor: accentColor,
                backgroundColor: accentColor
              }
            ]
          }}
          options={{
            scales: {
              y: { ticks: { callback: ms => dayjs.duration(ms, 'milliseconds').humanize() } }
            }
          }}
        />
      </Tile>,
    ListeningPerHour: () =>
      <Tile>
        <Chart
          type="line"
          title="Listening per hour"
          data={{
            labels: hourlyListeningCounter.keys(),
            datasets: [{
              data: hourlyListeningCounter.values(),
              borderColor: accentColor,
              backgroundColor: accentColor
            }]
          }}
          options={{
            scales: {
              x: { ticks: { callback: formatHour } },
              y: { ticks: { callback: ms => dayjs.duration(ms, 'milliseconds').humanize() } }
            }
          }}
        />
      </Tile>
  }
}