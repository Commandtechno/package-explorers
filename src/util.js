const path = require("path");
const fs = require("fs");

module.exports.hasFiles = (folder, files) =>
  files.every(file => fs.existsSync(path.resolve(folder, file)));