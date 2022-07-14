import axios from "axios";
import {
  Language,
  WEBSITE_URL_CHINESE,
  WEBSITE_URL_ENGLISH,
} from "./constants";
import { getUser } from "../database/dynamodb";

export const validateEnvVarExists = (envVar?: string) => {
  if (!envVar) {
    throw new Error(`${envVar} environment variable not found!`);
  }
  return envVar;
};

export const isAuthorized = (telegramId: number) =>
  getUser(telegramId).then((user) => !!user);

export const getHtmlContentToday = async (language: Language) => {
  const resp = await axios.get(
    language === Language.ENGLISH ? WEBSITE_URL_ENGLISH : WEBSITE_URL_CHINESE
  );
  return resp.data as string;
};

/**
 * Splits the input string into strings of 4100 chars long, while preventing
 * splits between the '_' markdown symbol.
 *
 * TODO: Legacy code >2 years old. Relook implementation and add test cases
 */
export const truncateMessage = (txt: string) => {
  const output: string[] = [];
  while (txt.length >= 4100) {
    let text1 = txt.substring(0, 4100);
    let text2 = txt.substring(4100);
    while (text1.slice(-1) !== " ") {
      text2 = text1.slice(-1).concat(text2);
      text1 = text1.substring(0, text1.length - 1);
    }

    // Handle Markdown breakage
    let tempText1 = text1;
    let acc = "";
    while (tempText1 !== "" && tempText1.slice(-1) !== "_") {
      acc = tempText1.slice(-1).concat(acc);
      tempText1 = tempText1.slice(0, tempText1.length - 1);
    }

    // If truncated in the middle of Markdown
    if (tempText1.slice(-2) === " _" || tempText1.slice(-2) === "\n_") {
      text1 = tempText1.slice(0, tempText1.length - 1);
      text2 = tempText1.slice(-1).concat(acc).concat(text2);
    }
    output.push(text1);
    txt = text2;
  }
  output.push(txt);
  return output;
};
