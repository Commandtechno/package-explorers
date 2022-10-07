import { BaseDirectory } from "@common/util/fs";
import { Row } from "@common/components/Row";

import { extractActivity } from "./tiles/Activity";
import { extractAdvertising } from "./tiles/Advertising";
import { extractVideos } from "./tiles/Videos";
import { extractProfile } from "./tiles/Profile";

export const name = "TikTok"
export const accentColor = '#FF004F'

export { default as banner } from './banner.svg'

/** @param {{ root: BaseDirectory }} */
export async function extract({ root }) {
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
