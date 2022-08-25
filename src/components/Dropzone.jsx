import { CustomDirectory } from "@common/util/fs";

export function Dropzone({ extract }) {
  return (
    <div
      className="dropzone"
      ondrop={ev => {
        const fs = ev.dataTransfer.items[0].webkitGetAsEntry().filesystem.root;
        const root = new CustomDirectory(fs);
        extract({ root });
      }}
      ondragenter={({ target }) => target.classList.add("dropzone-active")}
      ondragleave={({ target }) => target.classList.remove("dropzone-active")}
    >
      Drag files here!
    </div>
  );
}