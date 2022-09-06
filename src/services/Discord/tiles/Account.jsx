import dayjs from "dayjs";

import { Chart } from "@common/components/Chart";
import { Field } from "@common/components/Field";
import { Tile } from "@common/components/Tile";
import { SHORT_DATE_TIME } from "@common/constants/DATE_FORMATS";
import { BaseDirectory } from "@common/util/fs";
import { formatNum, formatCurrency } from "@common/util/helpers";

import { BLURPLE } from "../constants/COLORS";
import { getSnowflakeTimestamp, extractUserFlags } from "../helpers";

function formatDiscriminator(discriminator) {
  return "#" + discriminator.toString().padStart(4, "0");
}

/** @param {{ root: BaseDirectory }} */
export async function extractAccount({ root }) {
  const accountDir = await root.getDir("account");
  /** @type {import("../util/types").Account} */
  const user = await accountDir.getFile("user.json").then(file => file.json());
  const avatar = await accountDir.findFile(name => /^avatar\..*$/.test(name));
  const avatarUrl = await avatar.url();

  const created = getSnowflakeTimestamp(user.id);
  const moneySpent = formatCurrency(
    user.payments.reduce((total, { amount, amount_refunded }) => total + amount - amount_refunded, 0) / 100,
    user.payments[0]?.currency
  );

  const topGames = user.user_activity_application_statistics
    .sort((a, b) => b.total_duration - a.total_duration)
    .slice(0, 10);

  if (__ENV !== "dev")
    for (const game of topGames)
      game.application_name = await fetch(`https://discord.com/api/v10/applications/${game.application_id}/rpc`)
        .then(res => res.json())
        .then(res => res.name)
        .catch(() => { });

  return {
    Account: () =>
      <Tile>
        <h1>
          <img className="account-avatar" src={avatarUrl} alt="Avatar" />
          {user.username} <span className="account-discriminator">{formatDiscriminator(user.discriminator)}</span>
        </h1>
        <div className="field-group">
          <Field label="id" value={user.id} />
          <Field label="email" value={user.email} />
          <Field label="phone" value={user.phone} />
          <Field label="created" value={created.format(SHORT_DATE_TIME)} />
          <Field label="ip address" value={user.ip} />
          <Field label="friends" value={formatNum(user.relationships.length)} />
          <Field label="money spent" value={moneySpent} />
        </div>
      </Tile>,
    Flags: () =>
      <Tile size={2}>
        <h1>Flags</h1>
        <div className="field-group">
          {extractUserFlags(user.flags).map(({ flag, description }) => <Field label={flag} value={description} />)}
        </div>
      </Tile>,
    Connections: () =>
      <Tile>
        <h1>Connections</h1>
        <div className="field-group">
          {user.connections.map(({ type, name }) => (
            <Field label={type} value={name} />
          ))}
        </div>
      </Tile>,
    TopGames: () =>
      <Tile size={2}>
        <Chart
          type="bar"
          title={`Top ${topGames.length} games`}
          data={{
            labels: topGames.map(game => game.application_name ?? "Unknown"),
            datasets: [
              {
                data: topGames.map(game => game.total_duration),
                backgroundColor: BLURPLE
              }
            ]
          }}
          options={{
            scales: {
              y: { ticks: { callback: label => dayjs.duration(label, "seconds").humanize() } }
            }
          }}
        />
      </Tile>
  };
}