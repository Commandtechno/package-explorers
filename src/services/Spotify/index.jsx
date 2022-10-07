import { extractStreaming } from "./tiles/Streaming";
import { Row } from "@common/components/Row";

export const name = "Spotify";
export const accentColor = "#1DB954";

export { default as banner } from './banner.svg'

/** @param {{ root: BaseDirectory }} */
export async function extract({ root }) {
  const { TopTracks, TopArtists, ListeningPerMonth, ListeningPerHour } = await extractStreaming({ root });
  return <>
    <Row>
      <TopTracks />
      <TopArtists />
    </Row>
    <Row>
      <ListeningPerMonth />
      <ListeningPerHour />
    </Row>
  </>
}
