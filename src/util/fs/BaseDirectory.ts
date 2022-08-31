import { BaseFile } from "./BaseFile";

export abstract class BaseDirectory<File extends BaseFile> {
  isFile: false = false;
  isDirectory: true = true;

  abstract get name(): string;

  abstract getDir(name: string): Promise<BaseDirectory<File>>;
  abstract getFile(name: string): Promise<File>;

  async findDir(fn: (name: string) => boolean): Promise<BaseDirectory<File>> {
    for await (const entry of this) if (entry.isDirectory && fn(entry.name)) return entry;
  }

  async findFile(fn: (name: string) => boolean): Promise<File> {
    for await (const entry of this) if (entry.isFile && fn(entry.name)) return entry;
  }

  abstract [Symbol.asyncIterator](): AsyncGenerator<BaseDirectory<File> | File>;
}