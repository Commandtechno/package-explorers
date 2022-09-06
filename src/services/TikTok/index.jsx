import { BaseDirectory } from "@common/util/fs";
import { Row } from "@common/components/Row";

import { extractActivity } from "./tiles/Activity";

import banner from "./banner.svg";

export default {
  name: "TikTok",
  banner,
  /** @param {{ root: BaseDirectory }} */
  async extract({ root }) {
    const userData = await root.getFile("user_data.json").then(res => res.json());
    console.log(userData);
    const { Activity, VideosPerMonth } = await extractActivity({ userData });
    return <Row>
      <Activity />
      <VideosPerMonth />
    </Row>
  }
};