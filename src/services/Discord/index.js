const { hasFiles, format } = require("../../util");

const account = require("./account");
const activity = require("./activity");
const messages = require("./messages");
const programs = require("./programs");
const servers = require("./servers");

module.exports = async function (folder, update, end) {
  const times = {
    account: {},
    activity: {},
    messages: {},
    programs: {},
    servers: {}
  };

  const result = {
    times: {},

    account: {},
    activity: {},
    messages: {},
    programs: {},
    servers: {}
  };

  const isValid = hasFiles(folder, ["account", "activity", "messages", "programs", "servers"]);
  if (!isValid) return end("Invalid package");

  let start;

  result.times.account = "Loading...";
  start = Date.now();
  await account(folder, result);
  result.times.account = (Date.now() - start).toFixed(1) + "ms";
  update(format(result));

  start = Date.now();
  await activity(folder, result);
  result.times.activity = (Date.now() - start).toFixed(1) + "ms";
  update(format(result));

  start = Date.now();
  await messages(folder, result);
  result.times.messages = (Date.now() - start).toFixed(1) + "ms";
  update(format(result));

  end();
};