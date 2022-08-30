import { JSDirectory, detectSubfolder, JSFile } from "@common/util/fs";
import { $ } from "@common/util/helpers";
import { ZipDirectory } from "@common/util/test";
import { AsyncUnzipInflate, Unzip } from "fflate";

const app = $("app");

export function Dropzone({ extract }) {
  return (
    <div className="dropzone-container">
      <div
        id="dropzone"
        className="dropzone"
        ondrop={async function (ev) {
          ev.preventDefault();
          this.classList.remove("dropzone-active");

          const [item] = ev.dataTransfer.items;
          const entry = item.webkitGetAsEntry();
          if (item.type === "application/zip") {
            const uz = new Unzip();
            const dir = new ZipDirectory();
            uz.register(AsyncUnzipInflate);
            uz.onfile = file => dir.createFile(file);

            const stream = await new JSFile(entry).stream();
            const reader = await stream.getReader();
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              uz.push(value);
            }

            console.log(dir);
          }
          const fs = entry.filesystem.root;
          const root = await detectSubfolder(new JSDirectory(fs));

          // await extract({ root })
          //   .then(res => app.replaceChildren(<div className="result">{res}</div>))
          //   .catch(err => (document.body.innerText = err.message));
        }}
        ondragenter={function () {
          this.classList.add("dropzone-active");
        }}
        ondragleave={function () {
          this.classList.remove("dropzone-active");
        }}
        ondragover={ev => ev.preventDefault()}
      >
        Drop files here!
      </div>
    </div>
  );
}