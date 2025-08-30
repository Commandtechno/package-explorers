import dayjs from "dayjs";

import { BaseDirectory } from "@common/util/fs";
import { Tile } from "@common/components/Tile";
import { formatNum } from "@common/util/helpers";

import { getSnowflakeTimestamp } from "../helpers";
import { readline } from "@common/util/readline";
import { Counter } from "@common/util/counter";
import { ChannelTypes } from "../enums/ChannelTypes";
import { Chart } from '@common/components/Chart';

/** @param {{ root: BaseDirectory }} */
export async function extractActivity({ root, channelNames }) {
  const analyticsDir = await root
    .getDir("Activity/analytics")
    .catch(() => root.getDir('activity/analytics'));

  const createdAt = await root
    .getFile("Account/user.json")
    .catch(() => root.getFile('account/user.json'))
    .then(file => file.json())
    .then(user => getSnowflakeTimestamp(user.id));

  let events = {
    activity_updated: 0,
    channel_opened: 0,
    guild_viewed: 0,
    join_thread: 0,
    keyboard_shortcut_used: 0,
    launch_game: 0,
    message_edited: 0,
    message_deleted: 0,
    quickswitcher_opened: 0,
    add_reaction: 0,
    search_started: 0,
    slash_command_used: 0
  };

  let totalCallDuration = 0;
  let callTimeCounter = new Counter();

  let probabilityGender = [];
  let probabilityAge = [];


  if (__ENV === "dev")
    events = {
      activity_updated: 44111,
      // app_crashed: 102,
      // app_exception_thrown: 2260,
      // app_native_crash: 590,
      // app_opened: 8080,
      // captcha_served: 452,
      // captcha_solved: 293,
      channel_opened: 73147,
      // guild_joined: 1297,
      guild_viewed: 47901,
      // join_call: 370,
      // join_thread: 151,
      // join_voice_channel: 4748,
      keyboard_shortcut_used: 9803,
      launch_game: 5116,
      message_edited: 8682,
      message_deleted: 3131,
      // open_modal: 19995,
      // open_popout: 71701,
      quickswitcher_opened: 3313,
      add_reaction: 14762
      // search_started: 15296,
      // session_end: 14798,
      // session_start: 14858,
      // slash_command_used: 141
    };
  else
    for await (const eventsFile of analyticsDir) {
      if (!eventsFile.name.startsWith('events-')) continue
      const eventsStream = await eventsFile.stream();
      for await (const line of readline(eventsStream.getReader())) {
        const event = JSON.parse(line);
        switch (event.event_type) {
          case 'leave_voice_channel':
            if (!event.duration) break
            let channelType = parseInt(event.channel_type);
            if (channelType !== ChannelTypes.DM && channelType !== ChannelTypes.GROUP_DM) break
            callTimeCounter.incr(event.channel_id, parseInt(event.duration));
            totalCallDuration += event.duration;
            break;
          case "activity_updated":
          case "channel_opened":
          case "guild_viewed":
          case "join_thread":
          case "keyboard_shortcut_used":
          case "launch_game":
          case "message_edited":
          case "message_deleted":
          case "quickswitcher_opened":
          case "add_reaction":
          case "search_started":
          case "slash_command_used":
            events[event.event_type]++;
            break;
          default:
            if (event.predicted_gender)
              probabilityGender.push({
                timestamp: dayjs(event.day_pt),
                male: event.prob_male,
                female: event.prob_female,
                other: event.prob_non_binary_gender_expansive
              })

            if (event.predicted_age)
              probabilityAge.push({
                timestamp: dayjs(event.day_pt),
                '13-17': event.prob_13_17,
                '18-24': event.prob_18_24,
                '25-34': event.prob_25_34,
                '35+': event.prob_35_over
              })
        }
      }
    }

  const totalDays = dayjs().diff(createdAt, "days");
  const averageDailyGuilds = Math.round(events.guild_viewed / totalDays);
  const averageDailyChannels = Math.round(events.channel_opened / totalDays);

  const topCalls = callTimeCounter.sort().slice(0, 100);

  probabilityAge.sort((a, b) => a.timestamp.diff(b.timestamp));
  probabilityGender.sort((a, b) => a.timestamp.diff(b.timestamp));

  return {
    totalReactions: events.add_reaction,
    totalMessagesEdited: events.message_edited,
    totalMessagesDeleted: events.message_deleted,
    Analytics: () =>
      <Tile>
        <h1>Analytics</h1>
        <div>Your status was updated <b>{formatNum(events.activity_updated)}</b> times.</div>
        <div>Overall, you clicked on a server <b>{formatNum(events.guild_viewed)}</b> times, and a channel <b>{formatNum(events.channel_opened)}</b> times.</div>
        <div>That's an average of <b>{formatNum(averageDailyGuilds)}</b> servers and <b>{formatNum(averageDailyChannels)}</b> channels a day.</div>
        <div>Ring ring, you've spent <b>{dayjs.duration(totalCallDuration).humanize()}</b> in calls and voice channels.</div>
        <div>Fast typer? You used <b>{formatNum(events.keyboard_shortcut_used)}</b> keyboard shortcuts.</div>
        <div>Discord detected <b>{formatNum(events.launch_game)}</b> game launches.</div>
        <div>You opened the quick switcher <b>{formatNum(events.quickswitcher_opened)}</b> times.</div>
      </Tile>,
    TopCalls: () =>
      <Tile>
        <h1>Top Calls</h1>
        <table>
          <tbody>
            {topCalls.map(([channelId, duration], index) => (
              <tr>
                <td className="index">{index + 1}</td>
                <td>{channelNames.get(channelId) ?? "Unknown"}</td>
                <td>{dayjs.duration(duration).humanize()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>,
    PredictedGender: () =>
      <Tile>
        <Chart
          type="line"
          title="Predicted Gender"
          data={{
            labels: probabilityGender.map(({ timestamp }) => timestamp.format("YYYY-MM-DD")),
            datasets: [
              {
                label: 'Male',
                data: probabilityGender.map(({ male }) => male),
                borderColor: '#3498db',
              },
              {
                label: 'Female',
                data: probabilityGender.map(({ female }) => female),
                borderColor: '#e97bce',
              },
              {
                label: 'Other',
                data: probabilityGender.map(({ other }) => other),
                borderColor: '#1abc9c'
              }
            ]
          }}
          options={{
            scales: {
              y: {
                max: 1,
              }
            },
            plugins: {
              legend: {
                display: true,
              }
            },
          }}
        />
      </Tile>,
    PredictedAge: () =>
      <Tile>
        <Chart
          type="line"
          title="Predicted Age"
          data={{
            labels: probabilityAge.map(({ timestamp }) => timestamp.format("YYYY-MM-DD")),
            datasets: [
              {
                label: '13-17',
                data: probabilityAge.map(point => point['13-17']),
                borderColor: 'rgb(88, 101, 242)',
              },
              {
                label: '18-24',
                data: probabilityAge.map(point => point['18-24']),
                borderColor: 'rgb(155, 132, 239)',
              },
              {
                label: '25-34',
                data: probabilityAge.map(point => point['25-34']),
                borderColor: 'rgb(35, 165, 89)'
              },
              {
                label: '35+',
                data: probabilityAge.map(point => point['35+']),
                borderColor: 'rgb(252, 194, 69)'
              }
            ]
          }}
          options={{
            scales: {
              y: {
                max: 1,
              }
            },
            plugins: {
              legend: {
                display: true,
              }
            },
          }}
        />
      </Tile>
  };
}
