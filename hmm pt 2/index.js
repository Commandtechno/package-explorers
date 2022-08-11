import { FS } from "./fs.js";
import { getAllFileEntries } from "./util.js";

const drag = document.getElementById("drag");

drag.addEventListener(
  "dragover",
  async e => {
    e.preventDefault();
    console.log("File(s) in drop zone");
  },
  false
);

drag.addEventListener(
  "drop",
  async e => {
    e.preventDefault();
    console.log("File(s) dropped");
    const fs = new FS();
    fs.loadItems(e.dataTransfer.items);
  },
  false
);