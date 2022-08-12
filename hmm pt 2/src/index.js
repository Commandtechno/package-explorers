import { detectSubfolder, Directory, readDir } from "./fs.js";

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

    console.time();

    let total = 0;
    let oldest;
    let newest;

    for await (const channelDir of await root.dir("messages")) {
      if (channelDir.isDirectory) {
        const channel = await channelDir.file("channel.json", "json");
        for await (const message of await channelDir.file("messages.csv", "csv-with-headers")) {
          total++;
          const timestamp = new Date(message.Timestamp).getTime();
          if (!oldest || timestamp < oldest) oldest = timestamp;
          if (!newest || timestamp > newest) newest = timestamp;
        }
      }
    }

    console.log(`${total} messages`);
    console.log(`${oldest} messages`);
    console.log(`${newest} messages`);

    console.timeEnd();
  },
  false
);