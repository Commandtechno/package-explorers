import { Reader } from "gocsv";

export abstract class BaseFile {
  isFile: true = true;
  isDirectory: false = false;

  abstract get name(): string;

  abstract stream(): Promise<ReadableStream<Uint8Array>>;
  abstract blob(): Promise<Blob>;
  abstract text(): Promise<string>;

  async url() {
    return URL.createObjectURL(await this.blob());
  }

  async json() {
    return JSON.parse(await this.text());
  }

  csv(withHeaders?: false): AsyncGenerator<string[], any, unknown>;
  csv(withHeaders: true): AsyncGenerator<Record<string, string>, any, unknown>;
  async *csv(withHeaders): any {
    const reader = new Reader(await this.stream());

    // extract headers
    const headers =
      withHeaders && (await new Promise<string[]>(resolve => reader.readN(1, resolve)));
    const columns = withHeaders && headers.length;

    // https://github.com/pckhoi/gocsv/blob/main/src/reader.ts#L352
    // not using the built in method because its hard to do async generators
    do {
      // @ts-ignore
      await reader.r.fill();
      while (true) {
        // @ts-ignore
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
      // @ts-ignore
    } while (!reader.r.eof);
  }
}