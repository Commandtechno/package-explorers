import "./__jsx";
import "./dayjs";

import { detectSubfolder, CustomDirectory } from "./util/fs.js";
import { extractMessages } from "./tiles/Messages.jsx";
import { extractAccount } from "./tiles/Account";
import { extractActivity } from "./tiles/Activity";

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

    const Account = await extractAccount({ root });
    const Activity = await extractActivity({ root });
    const Messages = await extractMessages({ root });

    document.body.appendChild(
      <div className="container">
        <Account />
        <Messages />
      </div>
    );

    drag.remove();
  },
  false
);