import { Chart } from "@common/components/Chart";
import { Tile } from "@common/components/Tile";
import { BLURPLE } from "@common/services/Discord/constants/COLORS";
import { Counter } from "@common/util/counter";
import { formatNum } from "@common/util/helpers";
import dayjs from "dayjs";

export async function extractActivity({ userData }) {
  const videoList = userData["Activity"]["Video Browsing History"]["VideoList"];
  const likedList = userData["Activity"]["Like List"]["ItemFavoriteList"];
  const favoriteVideoList = userData["Activity"]["Favorite Videos"]["FavoriteVideoList"];

  let oldestVideoDate
  let newestVideoDate
  let monthlyCounter = new Counter();

  for (const video of videoList) {
    const date = dayjs(video.Date)
    monthlyCounter.incr(date.format("YYYY-MM"))

    if (!oldestVideoDate || date.isBefore(oldestVideoDate))
      oldestVideoDate = date
    if (!newestVideoDate || date.isAfter(newestVideoDate))
      newestVideoDate = date
  }

  let monthlyLabels = []
  for (
    let currentDate = oldestVideoDate.clone();
    currentDate.isBefore(newestVideoDate);
    currentDate = currentDate.add(1, "month")
  )
    monthlyLabels.push(currentDate.format("YYYY-MM"));

  return {
    Activity: () =>
      <Tile>
        <h1>Activity</h1>
        <div>You've watched <b>{formatNum(videoList.length)}</b> total videos.</div>
        <div>Out of those, you've liked <b>{formatNum(likedList.length)}</b> of them, and favorited <b>{formatNum(favoriteVideoList.length)}</b> of them.</div>
      </Tile>,
    VideosPerMonth: () =>
      <Tile>
        <Chart
          type="bar"
          title="Videos per month"
          data={{
            labels: monthlyLabels,
            datasets: [
              {
                data: monthlyLabels.map(label => monthlyCounter.get(label) ?? 0),
                backgroundColor: BLURPLE
              }
            ]
          }}
        />
      </Tile>,
  };
}