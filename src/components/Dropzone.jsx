import { CustomDirectory, detectSubfolder } from "@common/util/fs";
import { $ } from "@common/util/helpers";

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

          const fs = ev.dataTransfer.items[0].webkitGetAsEntry().filesystem.root;
          const root = await detectSubfolder(new CustomDirectory(fs));

          await extract({ root })
            .then(res => app.replaceChildren(<div className="result">{res}</div>))
            .catch(err => (document.body.innerText = err.message));
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