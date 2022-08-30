import { CustomDirectory } from "@common/util/fs";
import { $ } from "@common/util/helpers";
import { File } from "@common/util/test";
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
          directory
          webkitdirectory
          onchange={async function () {
            // for (let i = 0; i < this.files.length; i++) {
            //   const file = this.files.item(i);
            // }
            // console.log(this.files);

            console.log("a");
            const files = [];
            const uz = new Unzip();
            uz.register(AsyncUnzipInflate);
            uz.onfile = file => {
              const stream = new ReadableStream({
                start(controller) {
                  console.log("starting");
                  file.start();
                  file.ondata = (err, chunk, final) => {
                    if (err) writable.abort(err.message);
                    controller.enqueue(chunk);
                    if (final) controller.close();
                  };
                }
              });

              files.push(new Response(stream).blob().then(blob => new File(file.name, blob)));
            };

            console.log("b");
            const zip = this.files[0].stream().getReader();
            while (true) {
              console.log("c");
              const { value, done } = await zip.read();
              if (done) break;
              uz.push(value);
            }

            console.log(files);
          }}
        />
        Drop files here!
      </div>
    </div>
  );
}