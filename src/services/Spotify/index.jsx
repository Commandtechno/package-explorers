import { BaseDirectory } from "@common/util/fs";
import { extractStreaming } from "./tiles/Streaming";

import banner from './banner.png'
import { Row } from "@common/components/Row";

export default {
  name: 'Spotify',
  /** @param {{ root: BaseDirectory }} */
  banner,
  async extract({ root }) {
    const { TopTracks, TopArtists, ListeningPerHour } = await extractStreaming({ root });
    return <>
      <Row>
        <TopTracks />
        <TopArtists />
      </Row>
      <Row>
        <ListeningPerHour />
      </Row>
    </>
  }
}