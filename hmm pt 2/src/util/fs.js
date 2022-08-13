import { parse } from "./parse";

export async function readNextEntriesAsync(reader) {
  return await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
}

/** @return {Directory[]} */
export async function readDir(dir) {
  const entries = [];
  for await (const entry of dir) entries.push(entry);
  return entries;
}

/** @return {Directory} */
export async function detectSubfolder(dir) {
  const entries = await readDir(dir);
  return entries.length === 1 && entries[0].isDirectory ? entries[0] : dir;
}

export class Directory {
  fs;
  isDirectory = true;

  constructor(dir) {
    this.fs = dir;
  }

  dir(name) {
    return new Promise(resolve =>
      this.fs.getDirectory(name, {}, dir => resolve(new Directory(dir)))
    );
  }

  file(name, format, options) {
    return new Promise((resolve, reject) =>
      this.fs.getFile(
        name,
        {},
        entry => entry.file(file => resolve(parse(file, format, options))),
        reject
      )
    );
  }

  /** @return {AsyncGenerator<Directory>} */
  async *[Symbol.asyncIterator]() {
    const reader = this.fs.createReader();
    while (true) {
      const entries = await readNextEntriesAsync(reader);
      if (entries.length === 0) break;
      for (const entry of entries) yield entry.isDirectory ? new Directory(entry) : entry;
    }
  }
}