import { BaseFile } from "./BaseFile";

export class JSFile extends BaseFile {
  entry: FileSystemFileEntry;

  constructor(entry) {
    super();
    this.entry = entry;
  }

  get name() {
    return this.entry.name;
  }

  async file() {
    return new Promise<File>((resolve, reject) => this.entry.file(resolve, reject));
  }

  async blob(): Promise<Blob> {
    return await this.file();
  }

  async stream(): Promise<ReadableStream<Uint8Array>> {
    // @ts-ignore
    return await this.file().then(file => file.stream());
  }

  async text() {
    return await this.file().then(file => file.text());
  }
}