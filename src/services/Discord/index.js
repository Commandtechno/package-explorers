const { hasFiles } = require("../../util");

module.exports = function (folder, update, end) {
  const isValid = hasFiles(folder, ["account", "activity", "messages", "programs", "servers"]);
  if (!isValid) return end("Invalid package");

  update("cock");
  end();
};