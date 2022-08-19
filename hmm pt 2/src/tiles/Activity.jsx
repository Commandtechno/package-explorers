import { CustomDirectory } from "../util/fs";
import { Tile } from "../components/Tile";
import { formatNum, getSnowflakeTimestamp } from "../util/helpers";
import dayjs from "dayjs";

/** @param {{ root: CustomDirectory }} */
export async function extractActivity({ root }) {
  const analyticsDir = await root.dir("activity/analytics");
  const createdAt = await root
    .file("account/user.json")
    .then(file => file.json())
    .then(user => getSnowflakeTimestamp(user.id));

  // /** @type {import('../../event_types.json')} */
  let events = {
    activity_updated: 0,
    app_crashed: 0,
    app_exception_thrown: 0,
    app_native_crash: 0,
    app_opened: 0,
    captcha_served: 0,
    captcha_solved: 0,
    channel_opened: 0,
    guild_joined: 0,
    guild_viewed: 0,
    join_call: 0,
    join_thread: 0,
    join_voice_channel: 0,
    keyboard_shortcut_used: 0,
    launch_game: 0,
    message_edited: 0,
    message_deleted: 0,
    open_modal: 0,
    open_popout: 0,
    quickswitcher_opened: 0,
    add_reaction: 0,
    search_started: 0,
    session_end: 0,
    session_start: 0,
    slash_command_used: 0
  };

  if (__ENV === "dev")
    events = {
      activity_updated: 44111,
      // app_crashed: 102,
      // app_exception_thrown: 2260,
      // app_native_crash: 590,
      // app_opened: 8080,
      captcha_served: 452,
      captcha_solved: 293,
      channel_opened: 73147,
      // guild_joined: 1297,
      guild_viewed: 47901,
      join_call: 370,
      join_thread: 151,
      join_voice_channel: 4748,
      keyboard_shortcut_used: 9803,
      launch_game: 5116,
      message_edited: 8682,
      message_deleted: 3131,
      // open_modal: 19995,
      // open_popout: 71701,
      quickswitcher_opened: 3313,
      add_reaction: 14762,
      search_started: 15296,
      // session_end: 14798,
      // session_start: 14858,
      slash_command_used: 141
    };
  else {
    let currentLine = "";
    const chunks = await analyticsDir.findFile(name => /^events.*$/.test(name));
    for await (const chunk of chunks)
      chunk.split("\n").forEach(line => {
        try {
          const event = JSON.parse(currentLine + line);
          if (events.hasOwnProperty(event.event_type)) events[event.event_type]++;
          currentLine = "";
        } catch {
          currentLine = line;
        }
      });
  }

  // const totalAppIssues = events.app_crashed + events.app_exception_thrown + events.app_native_crash;
  const totalDays = dayjs().diff(createdAt, "days");
  const averageDailyGuilds = Math.round(events.guild_viewed / totalDays);
  const averageDailyChannels = Math.round(events.channel_opened / totalDays);

  return {
    totalReactions: events.add_reaction,
    totalMessagesEdited: events.message_edited,
    totalMessagesDeleted: events.message_deleted,
    Analytics: () => (
      <Tile>
        <h1>Analytics</h1>
        <div>
          Your status was updated <b>{formatNum(events.activity_updated)}</b> times.
        </div>
        {/* <div>
          Uh oh! Discord ran into <b>{formatNum(totalAppIssues)}</b> crashes and errors.
        </div>
        <div>
          You opened this fucking app <b>{formatNum(events.app_opened)}</b> times for some reason.
        </div> */}
        <div>
          Are you a robot? You were served <b>{formatNum(events.captcha_served)}</b> captchas and
          solved <b>{formatNum(events.captcha_solved)}</b> of them.
        </div>
        <div>
          Overall, you viewed <b>{formatNum(events.guild_viewed)}</b> servers and opened{" "}
          <b>{formatNum(events.channel_opened)}</b> channels.
        </div>
        <div>
          That's an average of <b>{formatNum(averageDailyGuilds)}</b> guilds and{" "}
          <b>{formatNum(averageDailyChannels)}</b> channels a day.
        </div>
        <div>
          Ring ring, you joined <b>{formatNum(events.join_call + events.join_voice_channel)}</b>{" "}
          calls and voice channels.
        </div>
        <div>
          Fast typer? You used <b>{formatNum(events.keyboard_shortcut_used)}</b> keyboard shortcuts.
        </div>
        <div>
          Discord detected <b>{formatNum(events.launch_game)}</b> game launches.
        </div>
        <div>
          In total, you edited <b>{formatNum(events.message_edited)}</b> messages and deleted{" "}
          <b>{formatNum(events.message_deleted)}</b> of them.
        </div>
        {/* <div>
          I can't think of a message for this one modals: <b>{formatNum(events.open_modal)}</b>{" "}
          popoust: <b>{formatNum(events.open_popout)}</b>
        </div> */}
        <div>
          You opened the quickswitcher <b>{formatNum(events.quickswitcher_opened)}</b> times.
        </div>
        {/* <div>
          You added <b>{formatNum()}</b> reactions to messages.
        </div> */}
        <div>
          You searched <b>{formatNum(events.search_started)}</b> times.
        </div>
        {/* <div>
          You ended your session <b>{formatNum(events.session_end)}</b> times and started
          <b>{formatNum(events.session_start)}</b> times.
        </div> */}
        <div>
          You joined <b>{formatNum(events.join_thread)}</b> threads.
        </div>
        <div>
          You used <b>{formatNum(events.slash_command_used)}</b> slash commands.
        </div>
      </Tile>
    )
  };
}