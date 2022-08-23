import { Row } from "../components/Row";
import { extractAccount } from "../tiles/Account";
import { extractActivity } from "../tiles/Activity";
import { extractMessages } from "../tiles/Messages";

/** @param {{ root: CustomDirectory }} */
export async function getIndexPage({ root }) {
  const { Account, Flags, Connections, TopGames } = await extractAccount({ root });
  const { totalReactions, totalMessagesEdited, totalMessagesDeleted, Analytics } =
    await extractActivity({ root });
  const { Messages, TopWords, TopEmojis, MessagesPerMonth, MessagesPerHour } =
    await extractMessages({
      root,
      totalReactions,
      totalMessagesEdited,
      totalMessagesDeleted
    });

  return () => (
    <>
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
        <TopGames />
        <TopWords />
        <TopEmojis />
      </Row>
      <Row>
        <MessagesPerMonth />
        <MessagesPerHour />
      </Row>
    </>
  );
}