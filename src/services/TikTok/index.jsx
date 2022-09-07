import { BaseDirectory } from "@common/util/fs";
import { Row } from "@common/components/Row";

import { extractActivity } from "./tiles/Activity";
import { extractAdvertising } from "./tiles/Advertising";
import { extractVideos } from "./tiles/Videos";
import { extractProfile } from "./tiles/Profile";

import banner from "./banner.svg";

export default {
  name: "TikTok",
  banner,
  /** @param {{ root: BaseDirectory }} */
  async extract({ root }) {
    const userData = await root.getFile("user_data.json").then(res => res.json());
    const { Activity } = await extractActivity({ userData });
    const { Advertisers } = await extractAdvertising({ userData });
    const { Profile } = await extractProfile({ userData });
    const { VideosPerMonth, VideosPerHour, TopVideos } = await extractVideos({ userData });

    return <>
      <Row>
        <Profile />
        <Activity />
        <Advertisers />
      </Row>
      <Row>
        <VideosPerMonth />
        <TopVideos />
        <VideosPerHour />
      </Row>
    </>;
  }
};