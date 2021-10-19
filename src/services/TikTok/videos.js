module.exports = function (package, result) {
  const videos = package.Video.Videos.VideoList ?? [];
  result.videos.total = videos.length.toLocaleString();
  result.videos.likes = videos.reduce((a, b) => a + parseInt(b.Likes), 0);
};