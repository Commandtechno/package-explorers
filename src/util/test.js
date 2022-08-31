// import { DecodeUTF8 } from "fflate";
// import { Reader } from "gocsv";
// import { parseCsv, parseJson } from "./parsers";

// export class JSFile {
//   /** @type {FileSystemFileEntry} */
//   entry;

//   /** @type {true} */
//   isFile = true;

//   /** @type {false} */
//   isDirectory = false;

//   constructor(entry) {
//     this.entry = entry;
//   }

//   get name() {
//     return this.entry.name;
//   }

//   /** @returns {Promise<File>} */
//   async file() {
//     return new Promise((resolve, reject) => this.entry.file(resolve, reject));
//   }

//   /** @returns {Promise<ReadableStream<Uint8Array>>} */
//   async stream() {
//     return await this.file().then(file => file.stream());
//   }

//   async text() {
//     return await this.file().then(file => file.text());
//   }

//   async json() {
//     return await this.text().then(text => JSON.parse(text));
//   }

//   async *[Symbol.asyncIterator]() {
//     const stream = new TextDecoderStream();
//     const reader = stream.readable.getReader();
//     const file = await this.stream();
//     file.pipeTo(stream.writable);

//     while (true) {
//       const { value, done } = await reader.read();
//       if (done) break;
//       yield value;
//     }
//   }
// }

// export class File {
//   /** @type {string} */
//   path;

//   /** @type {Blob} */
//   blob;

//   constructor(path, blob) {
//     this.path = path;
//     this.blob = blob;
//   }

//   url() {
//     return URL.createObjectURL(this.blob);
//   }

//   stream() {
//     return this.blob.stream();
//   }

//   async text() {
//     return await this.blob.text();
//   }

//   async json() {
//     return await parseJson(await this.text());
//   }

//   async *csv(options) {
//     return await parseCsv(this.stream(), options);
//   }
// }

// export class ZipFile {
//   /** @type {import("fflate").UnzipFile} */
//   file;

//   constructor(file) {
//     this.file = file;
//   }

//   /** @return {ReadableStream<Uint8Array>} */
//   stream() {
//     const file = this.file;
//     return new ReadableStream({
//       start(controller) {
//         file.ondata = (err, chunk, final) => {
//           if (err) writable.abort(err.message);
//           controller.enqueue(chunk);
//           if (final) controller.close();
//         };

//         file.start();
//       }
//     });
//   }

//   async blob() {
//     return await new Response(this.stream()).blob();
//   }

//   async url() {
//     return URL.createObjectURL(await this.blob());
//   }

//   /** @return {Promise<string>} */
//   async text() {
//     let text = "";
//     return new Promise((resolve, reject) => {
//       const decoder = new DecodeUTF8((chunk, final) => {
//         text += chunk;
//         if (final) resolve(text);
//       });

//       this.file.ondata = (err, chunk, final) => {
//         if (err) reject(err);
//         else decoder.push(chunk, final);
//       };

//       this.file.start();
//     });
//   }

//   async json() {
//     return await this.text().then(text => JSON.parse(text));
//   }
// }

// export class ZipDirectory {
//   entries = new Map();

//   /** @param {ZipFile} file */
//   createFile(file) {
//     const parts = file.name.split("/");
//     const name = parts.pop();

//     if (name) {
//       let parentDir = this;
//       parts.forEach(childDirName => {
//         if (parentDir.entries.has(childDirName)) parentDir = parentDir.entries.get(childDirName);
//         else {
//           const dir = new ZipDirectory();
//           parentDir.entries.set(childDirName, dir);
//           parentDir = dir;
//         }
//       });

//       parentDir.entries.set(name, file);
//     }
//   }
// }