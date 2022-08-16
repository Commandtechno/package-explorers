import "./__jsx";

import { detectSubfolder, Directory } from "./util/fs.js";
import { extractMessages } from "./tiles/Messages.jsx";

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

    const fs = e.dataTransfer.items[0].webkitGetAsEntry().filesystem.root;
    const root = await detectSubfolder(new Directory(fs));

    // /** @type {File} */
    // const file = await root.file("activity/analytics/events-2021-00000-of-00001.json");
    // const stream = new TextDecoderStream();
    // const reader = stream.readable.getReader();
    // file.stream().pipeTo(stream.writable);
    // let currentLine = "";
    // let eventTypes = new Set();
    // while (true) {
    //   const { done, value } = await reader.read();
    //   if (done) {
    //     break;
    //   }

    //   value.split("\n").forEach(line => {
    //     try {
    //       const event = JSON.parse(currentLine + line);
    //       eventTypes.add(event.event_type);
    //       currentLine = "";
    //     } catch {
    //       currentLine = line;
    //     }
    //   });
    // }

    // console.log(eventTypes);

    const Messages = await extractMessages({ root });

    document.body.appendChild(
      <div className="container">
        <Messages />
      </div>
    );

    drag.remove();
  },
  false
);