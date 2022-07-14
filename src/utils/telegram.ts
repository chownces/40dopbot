import axios from "axios";
import { ADMIN_CHAT_ID, TELEGRAM_TOKEN } from "./constants";
import { truncateMessage } from "./utils";

/**
 * Sends a Telegram message to the given `chatId` with Markdown parse mode.
 *
 * Automatically splits the message into 2 or more if more than 4100 chars.
 */
export const sendMessage = async (msg: string, chatId: string | number) => {
  const messages = truncateMessage(msg);
  for (const message of messages) {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }
    );
  }
};

/**
 * Sends a Telegram message to the admin chatid with the given log message in HTML parse mode.
 */
export const adminLog = (logType: string, logMessage: string) =>
  sendMessage(
    `*Log message*\n*Log type:* ${logType}\n\n${logMessage}`,
    ADMIN_CHAT_ID
  );
