const { getWords, sortFrequency } = require("../../util");

module.exports = function (package, result) {
  const totalMessages = Object.entries(
    package["Direct Messages"]["Chat History"].ChatHistory ?? {}
  );
  result.direct_messages.total_users = totalMessages.length;

  const users = [];
  const words = [];
  for (const [user, messages] of totalMessages) {
    for (const message of messages) {
      users.push(user);
      words.push(...getWords(message.Content));
    }
  }

  result.direct_messages.favorite_users = sortFrequency(users)
    .slice(0, 10)
    .map(({ element, count }) => element + " (" + count.toLocaleString() + ")");

  result.direct_messages.total_words = words.length;
  result.direct_messages.favorite_words = sortFrequency(words)
    .slice(0, 10)
    .map(({ element, count }) => element + " (" + count.toLocaleString() + ")");
};