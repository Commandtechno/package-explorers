import { Chart } from "@common/components/Chart";
import { Tile } from "@common/components/Tile";
import { BLURPLE } from "@common/services/Discord/constants/COLORS";
import { Counter } from "@common/util/counter";
import { BaseDirectory } from "@common/util/fs";
import { formatHour, rangeNum } from "@common/util/helpers";
import dayjs from "dayjs";

/** @param {{ root: BaseDirectory }} */
export async function extractStreaming({ root }) {
  let hourlyCounter = new Counter(rangeNum(24, i => [i, 0]));
  let monthlyCounter = new Counter();
  let trackCounter = new Counter();
  let artistCounter = new Counter();

  const streamingHistory = await root.getFile('StreamingHistory0.json').then(res => res.json())
  for (const track of streamingHistory) {
    const endTime = dayjs(track.endTime)
    hourlyCounter.incr(endTime.hour(), track.msPlayed);
    monthlyCounter.incr(endTime.format('YYYY-MM'), track.msPlayed);
    if (track.trackName !== 'Unknown Track' && track.artistName !== 'Unknown Artist') {
      trackCounter.incr(track.trackName, track.msPlayed);
      artistCounter.incr(track.artistName, track.msPlayed);
    }
  }

  const topTracks = trackCounter.sort().slice(0, 25)
  const topArtists = artistCounter.sort().slice(0, 25)

  const hourlyLabels = hourlyCounter.map(([hour]) => hour);

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
    ListeningPerHour: () =>
      <Tile>
        <Chart
          type="line"
          title="Listening per hour"
          data={{
            labels: hourlyLabels,
            datasets: [{
              data: hourlyLabels.map(hour => hourlyCounter.get(hour)),
              borderColor: BLURPLE,
              backgroundColor: BLURPLE
            }]
          }}
          options={{
            scales: {
              x: { ticks: { callback: formatHour } },
              y: { ticks: { callback: label => dayjs.duration(label, 'milliseconds').humanize() } }
            }
          }}
        />
      </Tile>
    // TopTracks: () =>
    //   <Tile>
    //     <Chart
    //       type="bar"
    //       title={`Top ${topTracks.length} tracks`}
    //       data={{
    //         labels: topTracks.map(([track]) => track),
    //         datasets: [
    //           {
    //             data: topTracks.map(([, count]) => count),
    //             backgroundColor: BLURPLE
    //           }
    //         ]
    //       }}
    //       options={{
    //         scales: {
    //           y: { ticks: { callback: label => dayjs.duration(label, 'milliseconds').humanize() } }
    //         }
    //       }}
    //     />
    //   </Tile>
  }
}