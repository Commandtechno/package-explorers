import { Reader } from "gocsv";

export class JSFile {
  /** @type {FileSystemFileEntry} */
  entry;

  /** @type {true} */
  isFile = true;

  /** @type {false} */
  isDirectory = false;

  constructor(entry) {
    this.entry = entry;
  }

  get name() {
    return this.entry.name;
  }

  /** @returns {Promise<File>} */
  async file() {
    return new Promise((resolve, reject) => this.entry.file(resolve, reject));
  }

  /** @returns {Promise<ReadableStream<Uint8Array>>} */
  async stream() {
    return await this.file().then(file => file.stream());
  }

  async text() {
    return await this.file().then(file => file.text());
  }

  async json() {
    return await this.text().then(text => JSON.parse(text));
  }

  /** @returns {AsyncGenerator<Record<string, string>>} */
  async *csv({ withHeaders }) {
    const reader = new Reader(await this.stream());

    // extract headers
    const headers = withHeaders && (await new Promise(resolve => reader.readN(1, resolve)));
    const columns = withHeaders && headers.length;

    // https://github.com/pckhoi/gocsv/blob/main/src/reader.ts#L352
    // not using the built in method because its hard to do async generators
    do {
      await reader.r.fill();
      while (true) {
        const record = reader._readRecord();
        if (record.length === 0) break;
        if (withHeaders) {
          const obj = {};
          for (let i = 0; i < columns; i++) obj[headers[i]] = record[i];
          yield obj;
        } else {
          yield record;
        }
      }
    } while (!reader.r.eof);
  }

  async *[Symbol.asyncIterator]() {
    const stream = new TextDecoderStream();
    const reader = stream.readable.getReader();
    const file = await this.stream();
    file.pipeTo(stream.writable);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      yield value;
    }
  }
}