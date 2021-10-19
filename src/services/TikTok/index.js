const { read, format } = require("../../util");

const profile = require("./profile");
const activity = require("./activity");
const comments = require("./comments");
const directMessages = require("./direct_messages");
const videos = require("./videos");

module.exports = async function (file, update, end) {
  if (!file.endsWith("user_data.json")) return end("Invalid package");
  const package = read(file);
  const result = {
    times: {},

    activity: {},
    comments: {},
    direct_messages: {},
    profile: {},
    videos: {}
  };

  let start;

  start = Date.now();
  activity(package, result);
  result.times.activity = (Date.now() - start).toFixed(1) + "ms";
  update(format(result));

  start = Date.now();
  comments(package, result);
  result.times.comments = (Date.now() - start).toFixed(1) + "ms";
  update(format(result));

  start = Date.now();
  directMessages(package, result);
  result.times.direct_messages = (Date.now() - start).toFixed(1) + "ms";
  update(format(result));

  start = Date.now();
  profile(package, result);
  result.times.profile = (Date.now() - start).toFixed(1) + "ms";
  update(format(result));

  start = Date.now();
  videos(package, result);
  result.times.videos = (Date.now() - start).toFixed(1) + "ms";
  update(format(result));

  end();
};