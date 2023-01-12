const AWS = require("aws-sdk");
const service = new AWS.CognitoIdentityServiceProvider();
const { returnHeaders } = require("./utils/headers.js");
const { verifyToken } = require("./utils/token.js");

exports.handler = async function (event) {
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

  switch (routeKey) {
    case "POST /auth":
      //sign up existing user
      ({ userName, password } = JSON.parse(body));
      params = {
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: process.env.USER_POOL_CLIENT,
        AuthParameters: { PASSWORD: password, USERNAME: userName },
      };
      const {
        AuthenticationResult: { AccessToken },
      } = await service.initiateAuth(params).promise();
      returnObject = { AccessToken: AccessToken };
      break;

    case "GET /auth/{email}":
      const userType = await verifyToken(headers);
      returnObject = { ...userType };
      break;

    case "HEAD /auth/{email}":
      //send reset code for existing user
      ({ email } = pathParameters);
      params = {
        ClientId: process.env.USER_POOL_CLIENT,
        Username: email,
      };
      await service.forgotPassword(params).promise();

      break;
    case "PATCH /auth/{email} reset":
      //reset password existing user
      ({ email } = pathParameters);
      ({ password } = JSON.parse(body));
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
      } else {
        statusCode = 401;
        returnObject = { message: "not authorized to reset password" };
      }
      break;

    case "PATCH /auth/{email} forgot":
      //confirm forgot password with conf code for existing user
      ({ email } = pathParameters);
      ({ confirmationCode, password } = JSON.parse(body));
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
      //resend confirmation for new user
      ({ email } = pathParameters);
      params = {
        ClientId: process.env.USER_POOL_CLIENT,
        Username: email,
      };
      await service.resendConfirmationCode(params).promise();
      break;

    case "POST /sign-up":
      ({ email, password } = JSON.parse(body));
      params = {
        ClientId: process.env.USER_POOL_CLIENT,
        Password: password,
        Username: email,
      };
      let newUser;
      try {
        //try to create a new user
        newUser = await service.signUp(params).promise();
      } catch (e) {
        //if already exists and not confirmed, delete old entry and sign up again
        const findExistingUser = {
          UserPoolId: process.env.USER_POOL_ID,
          Username: email,
        };
        const { UserAttributes } = await service
          .adminGetUser(findExistingUser)
          .promise();
        const userUnConfirmed =
          UserAttributes.find((entry) => entry.Name === "email_verified")
            .Value === "false"
            ? false
            : true;

        if (!userUnConfirmed) {
          await service.adminDeleteUser(findExistingUser).promise();
          newUser = await service.signUp(params).promise();
        } else {
          newUser = { message: "user already exists" };
          statusCode = 409;
        }
      }
      returnObject = { ...newUser, message: "user created" };
      break;

    case "PATCH /sign-up":
      //register new user with confirmation code
      ({ userName, confirmationCode } = JSON.parse(body));
      params = {
        ClientId: process.env.USER_POOL_CLIENT,
        Username: userName,
        ConfirmationCode: confirmationCode,
      };
      await service.confirmSignUp(params).promise();
      returnObject = { message: "successfully created" };
      break;

    default:
      //no matching request
      statusCode = 404;
      returnObject = { message: "no matching resource" };
  }

  return {
    statusCode: statusCode,
    headers: returnHeaders,
    body: JSON.stringify(returnObject),
  };
};
