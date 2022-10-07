import { Chart } from "@common/components/Chart";
import { Tile } from "@common/components/Tile";
import { Counter } from "@common/util/counter";
import { BaseDirectory } from "@common/util/fs";
import { formatHour, rangeDate, rangeNum } from "@common/util/helpers";
import dayjs from "dayjs";
import { accentColor } from "..";

/** @param {{ root: BaseDirectory }} */
export async function extractStreaming({ root }) {
  let hourlyListeningCounter = new Counter(rangeNum(24, i => [i, 0]));
  let monthlyListeningCounter = new Counter();
  let trackCounter = new Counter();
  let artistCounter = new Counter();

  const streamingHistory = await root.getFile('StreamingHistory0.json').then(res => res.json())
  for (const track of streamingHistory) {
    const endTime = dayjs(track.endTime)
    hourlyListeningCounter.incr(endTime.hour(), track.msPlayed);
    monthlyListeningCounter.incr(endTime.format('YYYY-MM'), track.msPlayed);
    if (track.trackName !== 'Unknown Track' && track.artistName !== 'Unknown Artist') {
      trackCounter.incr(track.trackName, track.msPlayed);
      artistCounter.incr(track.artistName, track.msPlayed);
    }
  }

  const topTracks = trackCounter.sort().slice(0, 25)
  const topArtists = artistCounter.sort().slice(0, 25)

  const monthlyListeningLabels = rangeDate(
    dayjs(streamingHistory[0].endTime),
    dayjs(streamingHistory[streamingHistory.length - 1].endTime), "month"
  ).map(date => date.format("YYYY-MM"))

  return {
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