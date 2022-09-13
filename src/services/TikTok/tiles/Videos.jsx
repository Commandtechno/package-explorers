import { Chart } from "@common/components/Chart";
import { Link } from "@common/components/Link";
import { Tile } from "@common/components/Tile";
import { BLURPLE } from "@common/services/Discord/constants/COLORS";
import { Counter } from "@common/util/counter";
import { formatHour, rangeDate, rangeNum } from "@common/util/helpers";
import dayjs from "dayjs";

export async function extractVideos({ userData }) {
  const watchedVideoList = userData["Activity"]["Video Browsing History"]["VideoList"];

  let oldestVideoDate;
  let newestVideoDate;
  let hourlyVideoCounter = new Counter(rangeNum(24, i => [i, 0]));
  let monthlyVideoCounter = new Counter();
  let videoCounter = new Counter();

  for (const video of watchedVideoList) {
    videoCounter.incr(video.VideoLink);

    const date = dayjs(video.Date);
    hourlyVideoCounter.incr(date.hour());
    monthlyVideoCounter.incr(date.format("YYYY-MM"));

    if (!oldestVideoDate || date.isBefore(oldestVideoDate)) oldestVideoDate = date;
    if (!newestVideoDate || date.isAfter(newestVideoDate)) newestVideoDate = date;
  }

  const monthlyLabels = rangeDate(oldestVideoDate, newestVideoDate, "month").map(date => date.format("YYYY-MM"));

  const topVideos = __ENV === 'dev'
    ? videoCounter.sort().slice(0, 25).map(([url, count]) => ([{ url }, count]))
    : await Promise.all(videoCounter.sort().slice(0, 25).map(async ([rawUrl, count]) => {
      const url = await fetch(`https://resolve-redirect.commandtechno.workers.dev/?q=${encodeURIComponent(rawUrl)}`)
        .then(res => res.text())
        .catch(() => rawUrl);

      const meta = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`)
        .then(res => res.json())
        .catch(() => { });

      return [{ url, meta }, count];
    }));

  return {
    VideosPerMonth: () =>
      <Tile>
        <Chart
          type="line"
          title="Videos watched per month"
          data={{
            labels: monthlyLabels,
            datasets: [
              {
                data: monthlyLabels.map(label => monthlyVideoCounter.get(label)),
                borderColor: BLURPLE,
                backgroundColor: BLURPLE
              }
            ]
          }}
        />
      </Tile>,
    VideosPerHour: () =>
      <Tile>
        <Chart
          type="line"
          title="Videos watched per hour"
          data={{
            labels: hourlyVideoCounter.map(([hour]) => formatHour(hour)),
            datasets: [
              {
                data: hourlyVideoCounter.map(([hour]) => hourlyVideoCounter.get(hour)),
                borderColor: BLURPLE,
                backgroundColor: BLURPLE
              }
            ]
          }}
        />
      </Tile>,
    TopVideos: () =>
      <Tile size={2}>
        <h1>Top {topVideos.length} most watched videos</h1>
        <table>
          <tbody>
            {topVideos.map(([{ url, meta }, count]) =>
              <tr>
                <td><Link href={url}>{meta ? `@${meta.author_name} - ${meta.title}` : 'Unavailable Video'}</Link></td>
                <td>{count}</td>
              </tr>
            )}
          </tbody>
        </table>
      </Tile>
  };
}