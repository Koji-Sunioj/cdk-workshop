const AWS = require("aws-sdk");
const service = new AWS.CognitoIdentityServiceProvider();

exports.handler = async function (event) {
  const { httpMethod, resource, body, pathParameters, queryStringParameters } =
    event;
  const routeKey = `${httpMethod} ${resource}`;

  let params, password, email, userName, confirmationCode;
  let returnObject = {};
  let statusCode = 200;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,PATCH,HEAD",
  };
  console.log(routeKey);
  switch (routeKey) {
    case "POST /auth":
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
    case "HEAD /auth/{email}":
      ({ email } = pathParameters);
      params = {
        ClientId: process.env.USER_POOL_CLIENT,
        Username: email,
      };
      await service.forgotPassword(params).promise();
      break;
    case "PATCH /auth/{email}":
      ({ email } = pathParameters);
      const { task } = queryStringParameters;
      ({ confirmationCode, password } = JSON.parse(body));
      console.log(password);
      switch (task) {
        case "forgot":
          params = {
            ClientId: process.env.USER_POOL_CLIENT,
            ConfirmationCode: confirmationCode,
            Password: password,
            Username: email,
          };
          await service.confirmForgotPassword(params).promise();
          break;
        case "reset":
          params = {
            Password: password,
            UserPoolId: process.env.USER_POOL_ID,
            Username: email,
            Permanent: true,
          };
          console.log(params);
          const something = await service
            .adminSetUserPassword(params)
            .promise();
          returnObject = { ...something };
          break;
      }
      break;

    case "HEAD /sign-up/{email}":
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
        newUser = await service.signUp(params).promise();
      } catch (e) {
        const findExistingUser = {
          UserPoolId: process.env.USER_POOL_ID,
          Username: email,
        };

        const { UserAttributes } = await service
          .adminGetUser(findExistingUser)
          .promise();
        const userConfirmed = UserAttributes.find(
          (entry) => entry.Name === "email_verified"
        ).Value;

        switch (userConfirmed) {
          case "false":
            await service.adminDeleteUser(findExistingUser).promise();
            newUser = await service.signUp(params).promise();
            break;
          default:
            newUser = { message: "user already exists" };
            statusCode = 409;
        }
      }
      returnObject = { ...newUser };
      break;
    case "PATCH /sign-up":
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
      statusCode = 404;
      returnObject = { message: "no matching resource" };
  }

  return {
    statusCode: statusCode,
    headers: headers,
    body: JSON.stringify(returnObject),
  };
};
