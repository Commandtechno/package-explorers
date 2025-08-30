import { BaseDirectory } from "@common/util/fs/BaseDirectory.js";
import { Row } from "@common/components/Row";
import { extractAccount } from "./tiles/Account";
import { extractActivity } from "./tiles/Activity";
import { extractMessages } from "./tiles/Messages.jsx";

export const name = "Discord"
export const accentColor = '#5865F2'
export const instructions = 'https://support.discord.com/hc/en-us/articles/360004027692-Requesting-a-Copy-of-your-Data'

export { default as banner } from './banner.svg'


/** @param {{ root: BaseDirectory }} */
export async function extract({ root }) {
  const channelNames = await root
    .getFile("Messages/index.json")
    .catch(() => root.getFile('messages/index.json'))
    .then(res => res.json())
    .then(res => new Map(Object.entries(res).map(([id, name]) => ([id, name?.endsWith('#0') ? name.slice(0, -2) : name]))));

  const { Account, Flags, Connections, TopGames } = await extractAccount({ root });
  const { totalReactions, totalMessagesEdited, totalMessagesDeleted, Analytics, TopCalls, PredictedGender, PredictedAge } =
    await extractActivity({ root, channelNames });
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
    channelNames,
    totalReactions,
    totalMessagesEdited,
    totalMessagesDeleted
  });

  return <>
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
      <TopCalls />
      <TopChannels />
      <TopGuilds />
    </Row>
    <Row>
      <MessagesPerMonth />
      <MessagesPerHour />
    </Row>
    <Row>
      <PredictedGender />
      <PredictedAge />
    </Row>
  </>;
}
