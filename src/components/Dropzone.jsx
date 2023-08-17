import { AsyncUnzipInflate, Unzip } from "fflate";
import { BaseDirectory, JSDirectory, JSFile, ZipDirectory, detectSubfolder } from "@common/util/fs";

import { $ } from "@common/util/helpers";
import { Spinner } from "./Spinner";

const app = $("app");

export function Dropzone({ extract }) {
  return (
    <div className="dropzone-container">
      <input type="file" id="dropzone-file-input" className="dropzone-file-input" />
      <div
        id="dropzone"
        className="dropzone"
        ondrop={async function (ev) {
          ev.preventDefault();
          this.classList.remove("dropzone-active");
          this.parentElement.replaceChild(<Spinner />, this);

          /** @type {BaseDirectory} */
          let root;

          const entry = ev.dataTransfer.items[0].webkitGetAsEntry();
          if (entry.isFile && entry.name.endsWith(".zip")) {
            const uz = new Unzip();
            const dir = new ZipDirectory(entry.name.replace(".zip", ""));
            uz.register(AsyncUnzipInflate);
            uz.onfile = file => dir.createFile(file);

            const stream = await new JSFile(entry).stream();
            const reader = await stream.getReader();
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              uz.push(value);
            }

            root = dir;
          } else if (entry.isDirectory) {
            root = await detectSubfolder(new JSDirectory(entry.filesystem.root));
          } else {
            throw new Error("Invalid file type");
          }

          await extract({ root })
            .then(res => app.replaceChildren(<div className="result">{res}</div>))
            .catch(err => {
              console.error(err);
              document.body.innerText = err.message;
            });
        }}
        ondragenter={function () {
          this.classList.add("dropzone-active");
        }}
        ondragleave={function () {
          this.classList.remove("dropzone-active");
        }}
        onclick={() => $("dropzone-file-input").click()}
        ondragover={ev => ev.preventDefault()}
      >
        Drop files here!
      </div>
    </div>
  );
}