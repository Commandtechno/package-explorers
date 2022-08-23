window.__ENV = new URL(location).searchParams.get("env");

import "./__jsx";
import "./dayjs";

import { detectSubfolder, CustomDirectory } from "./util/fs.js";
import { extractDiscord } from "./services/discord";

const drag = document.getElementById("drag");
const container = document.getElementById("container");

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

    const fs = e.dataTransfer.items[0].webkitGetAsEntry().filesystem.root;
    const root = await detectSubfolder(new CustomDirectory(fs));

    console.time();

    const Discord = await extractDiscord({ root });

    console.timeEnd();

    container.appendChild(<Discord />);

    drag.remove();
  },
  false
);