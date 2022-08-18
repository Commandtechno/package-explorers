import { CustomDirectory } from "../util/fs";

/** @param {{ root: CustomDirectory }} */
export async function extractActivity({ root }) {
  const analyticsDir = await root.dir("activity/analytics");

  let activityUpdated = 0;
  let appCrashed = 0;
  let appNativeCrash = 0;
  let appOpened = 0;
  let captchaServed = 0;
  let captchaSolved = 0;
  let guildJoined = 0;
  let guildViewed = 0;
  let joinCall = 0;
  let joinThread = 0;
  let joinVoiceChannel = 0;
  let keyboardShortcutsUsed = 0;
  let launchGame = 0;
  let messageEdited = 0;
  let messageDeleted = 0;
  let openModal = 0;
  let openPopout = 0;
  let quickSwitcherOpened = 0;
  let reactionAdd = 0;
  let searchStarted = 0;
  let sessionEnd = 0;
  let sessionStart = 0;
  let slashCommandUsed = 0;

  let currentLine = "";
  const chunks = await analyticsDir.findFile(name => /^events.*$/.test(name));
  for await (const chunk of chunks)
    chunk.split("\n").forEach(line => {
      try {
        const event = JSON.parse(currentLine + line);
        currentLine = "";

        switch (event.event_type) {
          case "app_opened":
            appOpened++;
            break;

          case "keyboard_shortcuts_used":
            keyboardShortcutsUsed++;
            break;

          case "reaction_add":
            reactionAdd++;
            break;

          case "search_started":
            searchStarted++;
            break;
        }
      } catch {
        currentLine = line;
      }
    });
}