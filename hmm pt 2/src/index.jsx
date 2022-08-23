window.__ENV = new URL(location).searchParams.get("env");

import "./__jsx";
import "./dayjs";

import { detectSubfolder, CustomDirectory } from "./util/fs.js";
import { getIndexPage } from "./pages";
import { addRoute, startRouter } from "./util/router";

const drag = document.getElementById("drag");
// const container = document.getElementById("container");

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

    const IndexPage = await getIndexPage({ root });
    addRoute("/", <IndexPage />);

    drag.remove();
    startRouter();
  },
  false
);