const { getWords, sortFrequency } = require("../../util");

module.exports = function (package, result) {
  const comments = package.Comment.Comments.CommentsList ?? [];
  result.comments.total = comments.length.toLocaleString();

  const words = [];
  for (const comment of comments) {
    words.push(...getWords(comment.Comment));
  }

  result.comments.total_words = words.length;
  result.comments.favorite_words = sortFrequency(words)
    .slice(0, 10)
    .map(({ element, count }) => element + " (" + count.toLocaleString() + ")");
};