import { JSFile } from "./JSFile";
import { BaseDirectory } from "./BaseDirectory";

export async function readNextEntriesAsync(reader: FileSystemDirectoryReader) {
  return await new Promise<FileSystemEntry[]>((resolve, reject) =>
    reader.readEntries(resolve, reject)
  );
}

export async function detectSubfolder(dir: JSDirectory): Promise<JSDirectory> {
  const entries = [];
  for await (const entry of dir) entries.push(entry);
  return entries.length === 1 && entries[0].isDirectory ? entries[0] : dir;
}

export class JSDirectory extends BaseDirectory<JSFile> {
  entry: FileSystemDirectoryEntry;

  constructor(entry) {
    super();
    this.entry = entry;
  }

  get name() {
    return this.entry.name;
  }

  getDir(name: string): Promise<BaseDirectory<JSFile>> {
    return new Promise((resolve, reject) =>
      this.entry.getDirectory(name, {}, dir => resolve(new JSDirectory(dir)), reject)
    );
  }

  getFile(name: string): Promise<JSFile> {
    return new Promise((resolve, reject) =>
      this.entry.getFile(name, {}, entry => resolve(new JSFile(entry)), reject)
    );
  }

  async *[Symbol.asyncIterator]() {
    const reader = this.entry.createReader();
    while (true) {
      const entries = await readNextEntriesAsync(reader);
      if (entries.length === 0) break;
      for (const entry of entries) {
        if (entry.isDirectory) yield new JSDirectory(entry);
        if (entry.isFile) yield new JSFile(entry);
      }
    }
  }
}