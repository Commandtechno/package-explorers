import { Tile } from "@common/components/Tile";
import { formatNum } from "@common/util/helpers";

export async function extractActivity({ userData }) {
  const watchedVideoList = userData["Activity"]["Video Browsing History"]["VideoList"];
  const uploadedVideoList = userData['Video']['Videos']['VideoList'];
  const likedVideoList = userData["Activity"]["Like List"]["ItemFavoriteList"];
  const favoriteVideoList = userData["Activity"]["Favorite Videos"]["FavoriteVideoList"];
  const commentList = userData["Comment"]["Comments"]["CommentsList"];
  const profile = userData["Profile"]['Profile Information']['ProfileMap'];

  return {
    Activity: () =>
      <Tile>
        <h1>Activity</h1>
        <div>You've watched <b>{formatNum(watchedVideoList.length)}</b> total videos.</div>
        <div>Out of those, you've liked <b>{formatNum(likedVideoList.length)}</b> of them, and favorited <b>{formatNum(favoriteVideoList.length)}</b> of them.</div>
        <div>You posted <b>{formatNum(commentList.length)}</b> comments.</div>
        <div>You've uploaded <b>{formatNum(uploadedVideoList.length)}</b> videos, and received <b>{formatNum(profile.likesReceived)}</b> likes.</div>
      </Tile>
  };
}