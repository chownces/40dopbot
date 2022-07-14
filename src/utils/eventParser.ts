import { adminLog, sendMessage } from "./telegram";
import { isAuthorized } from "./utils";

export const parseTelegramWebhook = (event: any) => {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return { error };
  }

  const msg = body.message;
  const chatId = msg.chat.id as number;
  const text = msg.text.trim() as string;
  const username = (msg.from.username || "") as string;
  const firstname = (msg.from.first_name || "") as string;
  const lastname = (msg.from.last_name || "") as string;

  /**
   * On regex match, execute the given function `fn`.
   *
   * If user does not exist in database (i.e. unauthorized), prompt user
   * to /start to create the database entry.
   */
  const on = async (
    command: RegExp,
    fn: (match: string[]) => Promise<any>,
    requireAuthorization = true
  ) => {
    const match = text.match(command);
    if (match) {
      if (requireAuthorization && !(await isAuthorized(chatId))) {
        return await sendMessage(`Please /start before usage`, chatId);
      }
      return await fn(match).catch((err) =>
        adminLog(
          "Command handler function catchall",
          `Command: ${command}\nChatid: ${chatId}\nUsername: ${username}\nFirstname: ${firstname}\nLastname: ${lastname}\nText: ${text}\n\nError: ${err}`
        )
      );
    }
  };

  return {
    on,
    userInfo: {
      telegramId: chatId,
      username,
      firstname,
      lastname,
    },
  };
};
