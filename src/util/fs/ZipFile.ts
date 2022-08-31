import { DecodeUTF8, UnzipFile } from "fflate";
import { BaseFile } from "./BaseFile";

export class ZipFile extends BaseFile {
  file: UnzipFile;

  constructor(file: UnzipFile) {
    super();
    this.file = file;
  }

  get name() {
    return this.file.name.split("/").pop();
  }

  async stream(): Promise<ReadableStream<Uint8Array>> {
    const file = this.file;
    return new ReadableStream({
      start(controller) {
        file.ondata = (err, chunk, final) => {
          if (err) return controller.error(err);
          controller.enqueue(chunk);
          if (final) controller.close();
        };

        file.start();
      }
    });
  }

  async blob() {
    return await new Response(await this.stream()).blob();
  }

  async text() {
    let text = "";
    return new Promise<string>((resolve, reject) => {
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