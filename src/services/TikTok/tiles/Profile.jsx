import { Field, FieldGroup } from "@common/components/Field";
import { Tile } from "@common/components/Tile";
import { SHORT_DATE_TIME } from "@common/constants/DATE_FORMATS";
import dayjs from "dayjs";

export async function extractProfile({ userData }) {
  const profile = userData["Profile"]['Profile Information']['ProfileMap'];
  const followingList = userData['Activity']["Following List"]?.["Following"] ?? [];
  const followerList = userData['Activity']["Follower List"]?.["Follower"] ?? [];

  return {
    Profile: () =>
      <Tile>
        <h1>Profile</h1>
        <FieldGroup>
          <Field label="username" value={profile.userName} />
          <Field label="email" value={profile.emailAddress} />
          <Field label="phone" value={profile.telephoneNumber} />
          <Field label="birthday" value={dayjs(profile.birthDate).format(SHORT_DATE_TIME)} />
          <Field label="description" value={profile.bioDescription} />
          <Field label="following" value={followingList.length} />
          <Field label="followers" value={followerList.length} />
        </FieldGroup>
      </Tile>
  };
}