import { validateEnvVarExists } from "./utils";

// Environment variables
export const ADMIN_CHAT_ID = validateEnvVarExists(process.env.ADMIN_CHAT_ID);
export const TELEGRAM_TOKEN = validateEnvVarExists(process.env.TELEGRAM_TOKEN);
export const WEBSITE_URL_ENGLISH = validateEnvVarExists(
  process.env.WEBSITE_URL_ENGLISH
);
export const WEBSITE_URL_CHINESE = validateEnvVarExists(
  process.env.WEBSITE_URL_CHINESE
);

/**
 * Only HTTP 200 response is used in this lambda, as Telegram servers
 * will keep retrying the webhook if a 200 response is not received.
 */
export const HTTP_200 = {
  statusCode: 200,
  body: JSON.stringify("Ok"),
};

export const DYNAMODB_USER_TABLE_NAME = "users";
export const DYNAMODB_MESSAGE_CACHE_TABLE_NAME = "message_cache";

export enum Language {
  ENGLISH = "english",
  CHINESE = "chinese",
}

export type TelegramUserInfo = {
  telegramId: number;
  username: string;
  firstname: string;
  lastname: string;
};

export const START_MESSAGE = `Welcome to the 40 Days of Prayer Bot! Receive the daily Prayer Guide at 6am each day.\n\nThis is an unofficial bot which pulls data from ${WEBSITE_URL_ENGLISH}\n\nCommands:\n/today Resend today's Prayer Guide\n/language Toggle between English and Chinese\n/unsubscribe Unsubscribe from this bot`;
