const { hours, months, years } = require("../../constants");
const { sortFrequency } = require("../../util");

module.exports = function (package, result) {
  const favoriteEffects = package.Activity["Favorite Effects"].FavoriteEffectList ?? [];
  const favoriteHashtags = package.Activity["Favorite Hashtags"].FavoriteHashtagList ?? [];
  const favoriteSounds = package.Activity["Favorite Sounds"].FavoriteSoundList ?? [];
  const favoriteVideos = package.Activity["Favorite Videos"].FavoriteVideoList ?? [];

  result.activity.favorite_effects = favoriteEffects.length.toLocaleString();
  result.activity.favorite_hashtags = favoriteHashtags.length.toLocaleString();
  result.activity.favorite_sounds = favoriteSounds.length.toLocaleString();
  result.activity.favorite_videos = favoriteVideos.length.toLocaleString();

  const videos = package.Activity["Video Browsing History"].VideoList ?? [];
  result.activity.videos = {};
  result.activity.videos.total = videos.length.toLocaleString();

  const sessions = package.Activity["Login History"].LoginHistoryList ?? [];
  const login = {
    dates: new Set(),
    ip_addresses: new Set(),
    devices: new Set(),
    systems: new Set(),
    carriers: new Set()
  };

  sessions.forEach(session => {
    login.dates.add(new Date(session.Date).toLocaleString());
    login.ip_addresses.add(session.IP);
    login.devices.add(session.DeviceModel);
    login.systems.add(session.DeviceSystem);
    login.carriers.add(session.Carrier);
  });

  result.activity.login = {
    dates: [...login.dates],
    ip_addresses: [...login.ip_addresses],
    devices: [...login.devices],
    systems: [...login.systems],
    carriers: [...login.carriers]
  };

  const followers = package.Activity["Follower List"].Followers ?? [];
  result.activity.followers = {};
  result.activity.followers.total = followers.length;
  result.activity.followers.first = followers
    .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
    .slice(0, 10)
    .map(follower => follower.UserName + " (" + new Date(follower.Date).toLocaleString() + ")");

  const following = package.Activity["Following List"].Following ?? [];
  result.activity.following = {};
  result.activity.following.total = following.length;
  result.activity.following.first = following
    .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
    .slice(0, 10)
    .map(followed => followed.UserName + " (" + new Date(followed.Date).toLocaleString() + ")");

  const perHour = Object.fromEntries(hours.map(hour => [hour, 0]));
  const perMonth = Object.fromEntries(months.map(month => [month, 0]));
  const perYear = Object.fromEntries(years.map(year => [year, 0]));

  const urls = [];
  for (const video of videos) {
    urls.push(video.VideoLink);
    const utc = new Date(video.Date);
    const date = new Date(utc.getTime() - utc.getTimezoneOffset() * 1000 * 60);
    perHour[hours[date.getHours()]]++;
    perMonth[months[date.getMonth()]]++;
    perYear[date.getFullYear()]++;
  }

  result.activity.videos.favorite = sortFrequency(urls)
    .slice(0, 10)
    .map(({ element, count }) => element + " (" + count.toLocaleString() + ")");

  result.activity.videos.per_hour = perHour;
  result.activity.videos.per_month = perMonth;
  result.activity.videos.per_year = Object.fromEntries(
    Object.entries(perYear).filter(([_, count]) => count)
  );
};