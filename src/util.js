const fs = require("fs");
const chalk = require("chalk");
const { resolve } = require("path");
const { excluded } = require("./constants");
const { parseFile } = require("@fast-csv/parse");

const isDir = path => fs.lstatSync(path).isDirectory();
const hasFiles = (folder, files) => files.every(file => fs.existsSync(resolve(folder, file)));
const getWords = string => {
  const words = string.match(/\w+/g);
  if (!words) return [];
  return words.filter(word => {
    if (word.length < 2) return;
    if (excluded.has(word.toLowerCase())) return;
    return true;
  });
};

const parseEmoji = emoji => {
  const [_, name, id] = emoji.slice(1, -1).split(":");
  return ":" + name + ":";
};

const sortFrequency = elements => {
  const frequency = {};
  const unique = [];

  for (const _element of elements) {
    const element = _element.toLowerCase();
    if (frequency[element] && typeof frequency[element] !== "number") continue;
    if (!frequency[element]) {
      frequency[element] = 0;
      unique.push(_element);
    }

    frequency[element]++;
  }

  return unique
    .map(element => ({ element, count: frequency[element.toLowerCase()] }))
    .sort((a, b) => b.count - a.count);
};

const format = (input, indent = 0, prefix = "") => {
  let output = "";

  if (Array.isArray(input))
    output += input.map(_input => format(_input, indent, "| ")).join("\n") + "\n";
  else if (typeof input === "object") {
    const entries = Object.entries(input);
    if (entries.length)
      output += entries
        .map(([key, value]) => {
          if (Array.isArray(value) || typeof value === "object")
            value = "\n" + format(value, indent + 2);
          else if (typeof value === "number") value = value.toLocaleString();
          return format(chalk.bold(proper(key)), indent) + ": " + value;
        })
        .join("\n");

    if (!output.endsWith("\n")) output += "\n";
  } else output += " ".repeat(indent) + prefix + input;

  return output;
};

const proper = input => {
  if (Array.isArray(input))
    return input.map(text => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()).join(" ");

  return proper(input.split(/[^a-zA-Z0-9]+/));
};

const read = path => {
  if (path.endsWith(".csv"))
    return new Promise((resolve, reject) => {
      const rows = [];
      parseFile(path, { headers: headers => headers.map(header => header.toLowerCase()) })
        .on("data", row => rows.push(row))
        .on("error", e => reject(e))
        .on("end", () => resolve(rows));
    });

  const file = fs.readFileSync(path, "utf-8");
  if (path.endsWith(".json")) {
    try {
      return JSON.parse(file);
    } catch {}
  }

  return file;
};

module.exports = {
  isDir,
  hasFiles,
  getWords,
  parseEmoji,
  sortFrequency,
  format,
  proper,
  read
};