import { BaseDirectory } from "./BaseDirectory";
import { ZipFile } from "./ZipFile";
import { UnzipFile } from "fflate";

export class ZipDirectory extends BaseDirectory<ZipFile> {
  entries = new Map<string, ZipDirectory | ZipFile>();
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  createFile(file: UnzipFile) {
    const parts = file.name.split("/");
    const name = parts.pop();

    if (name) {
      let parentDir: ZipDirectory = this;
      parts.forEach(part => {
        if (parentDir.entries.has(part)) {
          const childDir = parentDir.entries.get(part);
          if (!childDir.isDirectory) throw new Error(`File ${file.name} is a directory`);
          parentDir = childDir;
        } else {
          const childDir = new ZipDirectory(part);
          parentDir.entries.set(part, childDir);
          parentDir = childDir;
        }
      });

      parentDir.entries.set(name, new ZipFile(file));
    }
  }

  async getDir(name: string) {
    let parentDir: ZipDirectory = this;
    name.split("/").forEach(part => {
      const childDir = parentDir.entries.get(part);
      if (!childDir || !childDir.isDirectory) throw new Error(`Directory ${name} not found`);
      parentDir = childDir;
    });

    return parentDir;
  }

  async getFile(name: string) {
    const parts = name.split("/");
    const fileName = parts.pop();
    const parentDir = parts.length ? await this.getDir(parts.join("/")) : this;
    const file = parentDir.entries.get(fileName);
    if (!file || !file.isFile) throw new Error(`File ${name} not found`);
    return file;
  }

  async *[Symbol.asyncIterator]() {
    return yield* this.entries.values();
  }
}