import { chineseParser, englishParser } from "./parser/parser";
import {
  adminLog,
  sendMessage,
  parseTelegramWebhook,
  HTTP_200,
  START_MESSAGE,
  getHtmlContentToday,
  Language,
  ADMIN_CHAT_ID,
} from "./utils";
import {
  addUser,
  changeUserLanguage,
  deleteUser,
  getMessageCache,
  getUser,
  listUsers,
  upsertMessageCache,
} from "./database/dynamodb";

export const main = async (event) => {
  try {
    const parsedEvent = parseTelegramWebhook(event);

    if ("error" in parsedEvent) {
      await adminLog("Event body", "Error parsing Telegram webhook event body");
      return HTTP_200;
    }

    const { on, userInfo } = parsedEvent;

    await on(
      /\/start/,
      async (match) =>
        addUser(userInfo).then(() =>
          sendMessage(START_MESSAGE, userInfo.telegramId)
        ),
      false
    );

    await on(/^\/today$/, async (match) =>
      getUser(userInfo.telegramId)
        .then((userInfo) =>
          // User is already validated to exist in the `on` higher order function
          getMessageCache(userInfo!.language)
        )
        .then((message) => sendMessage(message, userInfo.telegramId))
    );

    await on(/^\/language$/, async (match) =>
      changeUserLanguage(userInfo.telegramId)
        .then(() => getUser(userInfo.telegramId))
        .then((userInfo) => getMessageCache(userInfo!.language))
        .then((message) => sendMessage(message, userInfo.telegramId))
    );

    await on(/^\/unsubscribe$/, async (match) =>
      deleteUser(userInfo.telegramId).then(() =>
        sendMessage(
          "Unsubscribed successfully! Please /start again if you wish to resubscribe.",
          userInfo.telegramId
        )
      )
    );
  } catch (err) {
    await adminLog("Application main catchall", `Error: ${err}`);
  }

  return HTTP_200;
};

/**
 * Scrapes and caches website content daily.
 */
export const scraper = async () => {
  await Promise.all([
    getHtmlContentToday(Language.ENGLISH)
      .then((englishHtml) => englishParser(englishHtml))
      .then(async (formattedContent) => {
        await upsertMessageCache(formattedContent, Language.ENGLISH);
        await sendMessage(formattedContent, ADMIN_CHAT_ID);
      }),
    getHtmlContentToday(Language.CHINESE)
      .then((chineseHtml) => chineseParser(chineseHtml))
      .then(async (formattedContent) => {
        await upsertMessageCache(formattedContent, Language.CHINESE);
        await sendMessage(formattedContent, ADMIN_CHAT_ID);
      }),
  ]).catch(async (err) => {
    await adminLog("Scraper error", err);
  });
  await adminLog("Scraper", "Scrape completed");
};

/**
 * Sends scheduled message to users daily.
 */
export const scheduler = async () => {
  const users = await listUsers();
  if (!users) {
    throw new Error("No users found during scheduler job!");
  }

  const englishContent = await getMessageCache(Language.ENGLISH);
  const chineseContent = await getMessageCache(Language.CHINESE);

  await Promise.all(
    users.map((user) => {
      return sendMessage(
        user.language === Language.ENGLISH ? englishContent : chineseContent,
        user.telegramId
      ).catch(async (err) => {
        await adminLog(
          "6am message",
          `Failed to send message to ${user.telegramId} ${user.username} ${user.firstname} ${user.lastname}\n\nError:\n${err}`
        );
      });
    })
  );

  await adminLog("6am message", "Successfully sent out 6am message");
};
