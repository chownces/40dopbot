import * as AWS from "aws-sdk";
import {
  DYNAMODB_MESSAGE_CACHE_TABLE_NAME,
  DYNAMODB_USER_TABLE_NAME,
  Language,
  TelegramUserInfo,
} from "../utils/constants";

AWS.config.update({
  region: "ap-southeast-1",
});
const DocumentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Function to create the required tables on DynamoDB.
 */
export const createTables = () => {
  const DynamoDB = new AWS.DynamoDB();

  // Database schema
  const userTableParams = {
    TableName: DYNAMODB_USER_TABLE_NAME,
    KeySchema: [
      {
        AttributeName: "telegramId",
        KeyType: "HASH",
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: "telegramId",
        AttributeType: "N",
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  };

  const messageCacheTableParams = {
    TableName: DYNAMODB_MESSAGE_CACHE_TABLE_NAME,
    KeySchema: [
      {
        AttributeName: "messageId",
        KeyType: "HASH",
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: "messageId",
        AttributeType: "S",
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  };

  DynamoDB.createTable(userTableParams, (err, data) =>
    err ? console.log(err) : console.log("User table created successfully!")
  );

  DynamoDB.createTable(messageCacheTableParams, (err, data) =>
    err
      ? console.log(err)
      : console.log("Message cache table created successfully!")
  );
};

export const getUser = (telegramId: number) => {
  const params = {
    Key: {
      telegramId,
    },
    TableName: DYNAMODB_USER_TABLE_NAME,
  };

  // TODO: Check
  return DocumentClient.get(params)
    .promise()
    .then((data) => data.Item);
};

/**
 * Adds user to database if he does not exist.
 */
export const addUser = (userInfo: TelegramUserInfo) => {
  return getUser(userInfo.telegramId).then((userExists) => {
    if (!userExists) {
      const params = {
        Item: {
          ...userInfo,
          language: Language.ENGLISH,
        },
        TableName: DYNAMODB_USER_TABLE_NAME,
      };

      return DocumentClient.put(params).promise();
    }
  });
};

export const listUsers = () => {
  const params = {
    TableName: DYNAMODB_USER_TABLE_NAME,
  };

  return DocumentClient.scan(params)
    .promise()
    .then((data) => data.Items);
};

export const changeUserLanguage = (telegramId: number) => {
  return getUser(telegramId).then((user) => {
    if (!user) {
      throw new Error("Failed to change user language! User does not exist!");
    }

    const updatedLanguage =
      user.language === Language.ENGLISH ? Language.CHINESE : Language.ENGLISH;

    const params = {
      Item: {
        ...user,
        language: updatedLanguage,
      },
      TableName: DYNAMODB_USER_TABLE_NAME,
    };

    return DocumentClient.put(params).promise();
  });
};

export const deleteUser = (telegramId: number) => {
  const params = {
    Key: {
      telegramId,
    },
    TableName: DYNAMODB_USER_TABLE_NAME,
  };

  return DocumentClient.delete(params).promise();
};

export const upsertMessageCache = (content: string, language: Language) => {
  const params = {
    Item: {
      messageId: language,
      content,
    },
    TableName: DYNAMODB_MESSAGE_CACHE_TABLE_NAME,
  };

  return DocumentClient.put(params).promise();
};

export const getMessageCache = (language: Language) => {
  const params = {
    Key: {
      messageId: language,
    },
    TableName: DYNAMODB_MESSAGE_CACHE_TABLE_NAME,
  };

  return DocumentClient.get(params)
    .promise()
    .then((data) => {
      if (!data.Item) {
        throw new Error(`No message content cached for ${language}!`);
      }
      return data.Item.content as string;
    });
};
