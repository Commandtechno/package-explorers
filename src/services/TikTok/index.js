const { read, format } = require("../../util");

module.exports = async function (file, update, end) {
  if (!file.endsWith("user_data.json")) return end("Invalid package");
  const package = read(file);
  const result = {
    activity: {},
    ads: {},
    settings: {},
    profile: {},
    videos: {}
  };

  const favoriteEffects = package.Activity["Favorite Effects"].FavoriteEffectList?.length ?? 0;
  result.activity.favorite_effects = favoriteEffects.toLocaleString();

  const favoriteHashtags = package.Activity["Favorite Hashtags"].FavoriteHashtagList?.length ?? 0;
  result.activity.favorite_hashtags = favoriteHashtags.toLocaleString();

  const favoriteSounds = package.Activity["Favorite Sounds"].FavoriteSoundList?.length ?? 0;
  result.activity.favorite_sounds = favoriteSounds.toLocaleString();

  const favoriteVideos = package.Activity["Favorite Videos"].FavoriteVideoList?.length ?? 0;
  result.activity.favorite_videos = favoriteVideos.toLocaleString();

  update(format(result));
  end();
};