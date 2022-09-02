import { Tile } from "@common/components/Tile";
import { formatNum } from "@common/util/helpers";

export async function extractActivity({ userData }) {
  const videoList = userData["Activity"]["Video Browsing History"]["VideoList"];
  const likedList = userData["Activity"]["Like List"]["ItemFavoriteList"];
  const favoriteVideoList = userData["Activity"]["Favorite Videos"]["FavoriteVideoList"];

  return () => (
    <Tile>
      <h1>Activity</h1>
      <div>
        You've watched <b>{formatNum(videoList.length)}</b> total videos.
      </div>
      <div>
        Out of those, you've liked <b>{formatNum(likedList.length)}</b> of them, and favorited{" "}
        <b>{formatNum(favoriteVideoList.length)}</b> of them.
      </div>
    </Tile>
  );
}