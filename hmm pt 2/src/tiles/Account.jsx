import { Field } from "../components/Field";
import { Row } from "../components/Row";
import { Tile } from "../components/Tile";
import { SHORT_DATE_TIME } from "../util/dateFormats";
import { extractUserFlags } from "../util/flags";
import { CustomDirectory } from "../util/fs";
import { getSnowflakeTimestamp } from "../util/helpers";

function formatDiscriminator(discriminator) {
  return "#" + discriminator.toString().padStart(4, "0");
}

/** @param {{ root: CustomDirectory }} */
export async function extractAccount({ root }) {
  const accountDir = await root.dir("account");
  const user = await root.file("account/user.json").then(res => res.json());
  console.log(user);
  const avatar = await accountDir.findFile(name => /avatar\..*/.test(name));
  const avatarUrl = URL.createObjectURL(await avatar.file());
  return () => (
    <Row>
      <Tile>
        <h1>
          <img className="account-avatar" src={avatarUrl} alt="Avatar" />
          {user.username}
          <span className="account-discriminator">{formatDiscriminator(user.discriminator)}</span>
        </h1>
        <div className="field-group">
          <Field label="id" value={user.id} />
          <Field label="email" value={user.email} />
          <Field label="phone" value={user.phone} />
          <Field label="created" value={getSnowflakeTimestamp(user.id).format(SHORT_DATE_TIME)} />
        </div>
      </Tile>
      <Tile>
        <h1>Flags</h1>
        <table>
          <tbody>
            {extractUserFlags(user.flags).map(({ flag, description }) => (
              <tr>
                <td>{flag}</td>
                <td>{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>
    </Row>
  );
}