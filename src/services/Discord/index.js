const { hasFiles, format } = require("../../util");

const account = require("./account");
const messages = require("./messages");
const servers = require("./servers");

module.exports = async function (folder, update, end) {
  const result = {
    times: {},

    account: {},
    messages: {},
    servers: {}
  };

  const isValid = hasFiles(folder, ["account", "activity", "messages", "programs", "servers"]);
  if (!isValid) return end("Invalid package");

  let start;

  start = Date.now();
  account(folder, result);
  result.times.account = (Date.now() - start).toFixed(1) + "ms";
  update(format(result));

  start = Date.now();
  await messages(folder, result);
  result.times.messages = (Date.now() - start).toFixed(1) + "ms";
  update(format(result));

  start = Date.now();
  servers(folder, result);
  result.times.servers = (Date.now() - start).toFixed(1) + "ms";
  update(format(result));

  end();
};