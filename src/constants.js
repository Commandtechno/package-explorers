const excluded = new Set([
  "you",
  "the",
  "to",
  "it",
  "and",
  "is",
  "that",
  "for",
  "in",
  "do",
  "have",
  "so",
  "what",
  "but",
  "not",
  "we",
  "of",
  "was",
  "are",
  "im",
  "like",
  "if",
  "he",
  "with",
  "has"
]);

const hours = [
  "12am",
  "1am",
  "2am",
  "3am",
  "4am",
  "5am",
  "6am",
  "7am",
  "8am",
  "9am",
  "10am",
  "11am",
  "12pm",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
  "11pm"
];

const months = [
  "Janruary",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const offset = 2000;
const maxYear = new Date().getFullYear() - offset;
const years = Array.from({ length: maxYear }).map((_, i) => offset + i);

module.exports = {
  hours,
  months,
  years,
  excluded
};