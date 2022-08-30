import { Reader } from "gocsv";

export function parseJson(text) {
  return JSON.parse(text);
}

/** @returns {AsyncGenerator<Record<string, string>>} */
export async function* parseCsv(stream, { withHeaders }) {
  const reader = new Reader(stream);

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