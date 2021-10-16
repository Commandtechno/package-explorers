const fs = require("fs");
const chalk = require("chalk");
const { resolve } = require("path");
const { parseFile } = require("@fast-csv/parse");

const isDir = path => fs.lstatSync(path).isDirectory();
const hasFiles = (folder, files) => files.every(file => fs.existsSync(resolve(folder, file)));

const sortFrequency = elements => {
  const frequency = {};
  const unique = [];

  for (const _element of elements) {
    const element = _element.toLowerCase();
    if (frequency[element] && typeof frequency[element] !== "number") continue;
    if (!frequency[element]) {
      frequency[element] = 0;
      unique.push(element);
    }

    frequency[element]++;
  }

  return unique
    .map(element => ({ element, count: frequency[element] }))
    .sort((a, b) => b.count - a.count);
};

const format = object =>
  Object.entries(object)
    .map(([_header, _values]) => {
      const entries = Object.entries(_values);
      if (!entries.length) return "";

      const header = chalk.bold(
        _header
          .split("_")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      );

      const list = entries.map(([key, value]) => {
        key = key
          .split("_")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        if (Array.isArray(value))
          value = "\n" + value.map(_value => "   | " + _value).join("\n") + "\n";

        return " - " + key + ": " + value;
      });

      return header + ":\n" + list.join("\n") + "\n\n";
    })
    .join("")
    .trim();

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
  sortFrequency,
  format,
  read
};