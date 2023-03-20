const AWS = require("aws-sdk");
const service = new AWS.CognitoIdentityServiceProvider();
const { returnHeaders } = require("./utils/headers.js");
const { verifyToken } = require("./utils/token.js");

import { APIGatewayEvent } from "aws-lambda";

exports.handler = async function (event: APIGatewayEvent) {
  const {
    httpMethod,
    resource,
    body,
    pathParameters,
    queryStringParameters,
    headers,
  } = event;
  let routeKey = `${httpMethod} ${resource}`;

  let params, password, email, userName, confirmationCode;
  let returnObject = {};
  let statusCode = 200;

  if (
    queryStringParameters !== null &&
    queryStringParameters.hasOwnProperty("task")
  ) {
    const { task } = queryStringParameters;
    routeKey = `${routeKey} ${task}`;
  }

  class HttpError extends Error {
    httpCode: number;
    constructor(message: string, { httpCode }: { httpCode: number }) {
      super(message);
      this.httpCode = httpCode;
    }
  }

  console.log(routeKey);

  try {
    switch (routeKey) {
      case "POST /auth":
        ({ userName, password } = JSON.parse(body!));
        params = {
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: process.env.USER_POOL_CLIENT,
          AuthParameters: { PASSWORD: password, USERNAME: userName },
        };
        const {
          AuthenticationResult: { AccessToken, ExpiresIn },
        } = await service.initiateAuth(params).promise();
        returnObject = {
          AccessToken: AccessToken,
          expires: ExpiresIn,
          userName: userName,
        };
        break;

      case "GET /auth/{email}":
        const userType = await verifyToken(headers);
        returnObject = { ...userType };
        break;

      case "HEAD /auth/{email}":
        ({ email } = pathParameters!);
        params = {
          ClientId: process.env.USER_POOL_CLIENT,
          Username: email,
        };
        await service.forgotPassword(params).promise();
        break;

      case "PATCH /auth/{email} reset":
        ({ email } = pathParameters!);
        ({ password } = JSON.parse(body!));
        const { type } = await verifyToken(headers);
        if (type === "user") {
          params = {
            Password: password,
            UserPoolId: process.env.USER_POOL_ID,
            Username: email,
            Permanent: true,
          };
          await service.adminSetUserPassword(params).promise();
          returnObject = { message: "successfully updated" };
        }
        break;

      case "PATCH /auth/{email} forgot":
        ({ email } = pathParameters!);
        ({ confirmationCode, password } = JSON.parse(body!));
        params = {
          ClientId: process.env.USER_POOL_CLIENT,
          ConfirmationCode: confirmationCode,
          Password: password,
          Username: email,
        };
        await service.confirmForgotPassword(params).promise();
        returnObject = { message: "successfully updated" };
        break;

      case "HEAD /sign-up/{email}":
        ({ email } = pathParameters!);
        params = {
          ClientId: process.env.USER_POOL_CLIENT,
          Username: email,
        };
        await service.resendConfirmationCode(params).promise();
        break;

      case "POST /sign-up":
        ({ email, password } = JSON.parse(body!));
        const secretsmanager = new AWS.SecretsManager();
        const { SecretString } = await secretsmanager
          .getSecretValue({
            SecretId: "dev_users",
          })
          .promise();
        const guesList = JSON.parse(SecretString).allows_users.split(",");
        if (!guesList.includes(email)) {
          throw new HttpError("user not on guest list", { httpCode: 403 });
        }
        params = {
          ClientId: process.env.USER_POOL_CLIENT,
          Password: password,
          Username: email,
        };
        let newUser;
        try {
          newUser = await service.signUp(params).promise();
        } catch (e) {
          const findExistingUser = {
            UserPoolId: process.env.USER_POOL_ID,
            Username: email,
          };
          const { UserAttributes } = await service
            .adminGetUser(findExistingUser)
            .promise();
          const userUnConfirmed =
            UserAttributes.find(
              (entry: { [index: string]: string }) =>
                entry.Name === "email_verified"
            ).Value === "false"
              ? false
              : true;

          if (!userUnConfirmed) {
            await service.adminDeleteUser(findExistingUser).promise();
            newUser = await service.signUp(params).promise();
          } else {
            throw new HttpError("user already exists", {
              httpCode: 409,
            });
          }
        }
        returnObject = { ...newUser, message: "user created" };
        break;
      case "PATCH /sign-up":
        ({ userName, confirmationCode } = JSON.parse(body!));
        params = {
          ClientId: process.env.USER_POOL_CLIENT,
          Username: userName,
          ConfirmationCode: confirmationCode,
        };
        await service.confirmSignUp(params).promise();
        returnObject = { message: "successfully created" };
        break;

      default:
        statusCode = 404;
        returnObject = { message: "no matching resource" };
    }
  } catch (error) {
    console.log(error);
    if (error instanceof HttpError) {
      statusCode = error.httpCode;
      returnObject = { message: error.message };
    } else {
      statusCode = 400;
      returnObject = { message: (error as { message: string })!.message };
    }
  }

  return {
    statusCode: statusCode,
    headers: returnHeaders,
    body: JSON.stringify(returnObject),
  };
};
