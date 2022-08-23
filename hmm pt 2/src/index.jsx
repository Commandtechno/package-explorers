window.__ENV = new URL(location).searchParams.get("env");

import "./__jsx";
import "./dayjs";

import { detectSubfolder, CustomDirectory } from "./util/fs.js";
import { extractMessages } from "./tiles/Messages.jsx";
import { extractAccount } from "./tiles/Account";
import { extractActivity } from "./tiles/Activity";
import { Row } from "./components/Row";

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
    const root = await detectSubfolder(new CustomDirectory(fs));

    console.time();

    const { Account, Flags, Connections, TopGames } = await extractAccount({ root });
    const { totalReactions, totalMessagesEdited, totalMessagesDeleted, Analytics } =
      await extractActivity({ root });
    const {
      Messages,
      TopWords,
      TopEmojis,
      TopDms,
      TopChannels,
      TopGuilds,
      MessagesPerMonth,
      MessagesPerHour
    } = await extractMessages({
      root,
      totalReactions,
      totalMessagesEdited,
      totalMessagesDeleted
    });

    console.timeEnd();

    document.body.appendChild(
      <div className="container">
        <Row>
          <Account />
          <Flags />
          <Connections />
        </Row>
        <Row>
          <Analytics />
          <Messages />
        </Row>
        <Row>
          <TopWords />
          <TopGames />
          <TopEmojis />
        </Row>
        <Row>
          <TopDms />
          <TopChannels />
          <TopGuilds />
        </Row>
        <Row>
          <MessagesPerMonth />
          <MessagesPerHour />
        </Row>
      </div>
    );

    drag.remove();
  },
  false
);