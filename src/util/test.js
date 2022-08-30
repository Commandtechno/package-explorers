import { DecodeUTF8 } from "fflate";
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

export class File {
  /** @type {string} */
  path;

  /** @type {Blob} */
  blob;

  constructor(path, blob) {
    this.path = path;
    this.blob = blob;
  }

  url() {
    return URL.createObjectURL(this.blob);
  }

  stream() {
    return this.blob.stream();
  }

  async text() {
    return await this.blob.text();
  }

  async json() {
    return await this.text().then(text => JSON.parse(text));
  }

  /** @returns {AsyncGenerator<Record<string, string>>} */
  async *csv({ withHeaders }) {
    const reader = new Reader(this.stream());

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
}

export class ZipFile {
  /** @type {import("fflate").UnzipFile} */
  file;

  constructor(file) {
    this.file = file;
  }

  /** @return {ReadableStream<Uint8Array>} */
  stream() {
    const file = this.file;
    return new ReadableStream({
      start(controller) {
        file.start();
        file.ondata = (err, chunk, final) => {
          if (err) writable.abort(err.message);
          controller.enqueue(chunk);
          if (final) controller.close();
        };
      }
    });
  }

  /** @return {Promise<string>} */
  async text() {
    this.stream().blob;

    let text = "";
    return new Promise((resolve, reject) => {
      const decoder = new DecodeUTF8((chunk, final) => {
        text += chunk;
        if (final) resolve(text);
      });

      this.file.ondata = (err, chunk, final) => {
        if (err) reject(err);
        else decoder.push(chunk, final);
      };

      this.file.start();
    });
  }
}

export class Folder {
  /** @type {FileList} */
  files;

  constructor(files) {
    this.files = files;
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.files.length; i++) yield this.files.item(i);
  }
}