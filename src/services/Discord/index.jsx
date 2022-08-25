import { extractMessages } from "./tiles/Messages.jsx";
import { extractAccount } from "./tiles/Account";
import { extractActivity } from "./tiles/Activity";
import { Row } from "@common/components/Row";

import banner from "./banner.svg";

export default {
  name: "Discord",
  banner,
  /** @param {{ root: CustomDirectory }} */
  async extract({ root }) {
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
      </>
    );
  }
};