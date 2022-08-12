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

    root.dir("messages", async channelsDir => {
      for await (const channelDir of channelsDir) {
        if (channelDir.isDirectory) {
          const file = await channelDir.file("channel.json", "json");
          console.log(file);
        }
        // const channel = channelDir;
      }
    });
    // let entries = await convertItems(e.dataTransfer.items);
    // if (entries.length === 1 && entries[0].isDirectory)
    //   entries = await readEntries(entries[0].createReader());

    // const dir = new Directory();
    // await dir.load(entries);
    // console.log(dir);

    // const channelDirs = await dir.readDir("messages");
    // let i = 0;
    // for (const [, channelDir] of channelDirs) {
    //   const channel = await channelDir.readFile(`channel.json`, "json");
    //   const messages = await channelDir.readFile(`messages.csv`, "csv-with-headers", message => {
    //     i++;
    //   });
    // }
    // console.log(i);

    // await parseCsvWithHeaders(
    //   await fs.readFile("/messages/c145127225295896576/messages.csv"),
    //   row => {
    //     console.log(row);
    //   }
    // );

    // console.log("hello");
  },
  false
);