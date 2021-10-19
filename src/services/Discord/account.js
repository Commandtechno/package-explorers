const { read } = require("../../util");
const { resolve } = require("path");

module.exports = function (folder, result) {
  const accountPath = resolve(folder, "account");
  const userPath = resolve(accountPath, "user.json");
  const user = read(userPath);

  result.account.id = user.id;
  result.account.username = user.username + "#" + user.discriminator.toString().padStart(4, "0");
  result.account.created = new Date(
    Number((BigInt(user.id) >> 22n) + 1420070400000n)
  ).toLocaleString();

  result.account.premium = !!user.premium_until;
  result.account.uses_mobile = user.has_mobile;

  result.account.email = user.email;
  result.account.phone_number = user.phone;
  result.account.ip_address = user.ip;

  result.account.connections = {};
  user.connections.forEach(({ name, type, visibility, friend_sync }) => {
    if (!visibility || friend_sync) name += " (Hidden)";
    if (friend_sync) name += " (Internal)";
    if (result.account.connections[type]) {
      if (typeof result.account.connections[type] === "string")
        result.account.connections[type] = [result.account.connections[type]];
      result.account.connections[type].push(name);
    } else result.account.connections[type] = name;
  });
};