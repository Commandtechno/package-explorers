import { CustomDirectory } from "@common/util/fs";
import { $ } from "@common/util/helpers";
import { AsyncUnzipInflate, Unzip } from "fflate";

export function Dropzone({ extract }) {
  return (
    <div className="dropzone-container">
      <div
        id="dropzone"
        className="dropzone"
        // ondrop={ev => {
        //   ev.preventDefault();
        //   $("dropzone").classList.remove("dropzone-active");
        //   const fs = ev.dataTransfer.items[0].webkitGetAsEntry().filesystem.root;
        //   const root = new CustomDirectory(fs);
        //   extract({ root }).then(console.log).catch(console.log);
        // }}
        ondragenter={function () {
          this.classList.add("dropzone-active");
        }}
        ondragleave={function () {
          this.classList.remove("dropzone-active");
        }}
      >
        <input
          className="dropzone-input"
          type="file"
          multiple
          onchange={async function () {
            const uz = new Unzip();
            uz.register(AsyncUnzipInflate);
            uz.onfile = console.log;

            const zip = this.files[0].stream().getReader();
            while (true) {
              const { value, done } = await zip.read();
              if (done) break;
              uz.push(value);
            }
          }}
        />
        Drop files here!
      </div>
    </div>
  );
}