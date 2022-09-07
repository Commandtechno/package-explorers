import { Tile } from "@common/components/Tile";

export async function extractAdvertising({ userData }) {
  const advertisersList = userData['Ads and data']['Ads Based On Data Received From Partners']['AdvertiserList'].split(/(?<!\s),(?!\s)/);
  return {
    Advertisers: () =>
      <Tile>
        <h1>Advertisers</h1>
        <ul>{advertisersList.map(advertiser => <li>{advertiser}</li>)}</ul>
      </Tile>
  };
}