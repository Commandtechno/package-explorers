import { Reader } from "gocsv";

export async function parseText(file) {
  return await file.text();
}

export async function parseJson(file) {
  return JSON.parse(await parseText(file));
}

export async function parseCsv(file, cb) {
  new Reader(file.stream()).readAll(cb);
}

export async function parseCsvWithHeaders(file, cb) {
  const reader = new Reader(file.stream());
  await reader.readN(1, async headers => {
    let columns = headers.length;
    await reader.readAll(row => {
      let obj = {};
      for (let i = 0; i < columns; i++) obj[headers[i]] = row[i];
      cb(obj);
    });
  });
}

export async function parse(file, format, options) {
  switch (format) {
    case "json":
      return await parseJson(file, options);
    case "csv":
      return await parseCsv(file, options);
    case "csv-with-headers":
      return await parseCsvWithHeaders(file, options);
    case "text":
      return await parseText(file, options);
    default:
      return file;
  }
}