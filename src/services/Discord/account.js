const { sortFrequency, read } = require("../../util");
const { resolve } = require("path");

module.exports = (folder, result) => {
  const accountPath = resolve(folder, "account");
  const userPath = resolve(accountPath, "user.json");
  const user = read(userPath);

  result.account.id = user.id;
  result.account.username = user.username;
  result.account.tag = "#" + user.discriminator.toString().padStart(4, "0");
  result.account.premium = !!user.premium_until;
  result.account.uses_mobile = user.has_mobile;

  result.account.email = user.email;
  result.account.phone_number = user.phone;
  result.account.ip_address = user.ip;

  result.account.connections = user.connections.map(({ name, type, visibility }) => {
    let connection = type + ": " + name;
    if (!visibility) connection += " (Hidden)";
    return connection;
  });
};