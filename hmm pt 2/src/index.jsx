import "./__jsx";

import { detectSubfolder, Directory } from "./util/fs.js";
import { Chart } from "./components/Chart.jsx";
import dayjs from "dayjs";

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
    let months = new Map();

    for await (const channelDir of await root.dir("messages")) {
      if (channelDir.isDirectory) {
        const channel = await channelDir.file("channel.json", "json");
        for await (const message of await channelDir.file("messages.csv", "csv-with-headers")) {
          total++;
          const date = dayjs(message.Timestamp);
          if (!oldest || date.isBefore(oldest)) oldest = date;
          if (!newest || date.isAfter(newest)) newest = date;

          const monthKey = date.format("YYYY-MM");
          if (!months.has(monthKey)) months.set(monthKey, 0);
          months.set(monthKey, months.get(monthKey) + 1);
        }
      }
    }

    console.log(`${total} messages`);
    console.log(`${oldest} messages`);
    console.log(`${newest} messages`);
    console.log(months);

    console.timeEnd();

    let labels = [];
    let current = oldest.clone();
    while (current.year() <= newest.year() || current.month() <= newest.month()) {
      labels.push(current.format("YYYY-MM"));
      current = current.add(1, "month");
    }

    document.body.appendChild(
      <Chart
        type="bar"
        data={{
          labels,
          datasets: [{ label: "Messages Per Month", data: labels.map(label => months.get(label)) }]
        }}
      />
    );
    drag.remove();
  },
  false
);