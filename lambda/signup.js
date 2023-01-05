const AWS = require("aws-sdk");
const service = new AWS.CognitoIdentityServiceProvider();

exports.handler = async function (event) {
  const { httpMethod, resource, body } = event;
  const routeKey = `${httpMethod} ${resource}`;

  let params, password, email, userName;
  let returnObject = {};
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,PATCH",
  };

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

    case "POST /sign-up":
      ({ email, password } = JSON.parse(body));
      const { queryStringParameters } = event;
      if (
        queryStringParameters !== null &&
        Boolean(queryStringParameters.resend)
      ) {
        params = {
          ClientId: process.env.USER_POOL_CLIENT,
          Username: email,
        };
        await service.resendConfirmationCode(params).promise();
      } else {
        params = {
          ClientId: process.env.USER_POOL_CLIENT,
          Password: password,
          Username: email,
        };
        let newUser;
        try {
          newUser = await service.signUp(params).promise();
        } catch (e) {
          const cancelIt = {
            UserPoolId: process.env.USER_POOL_ID,
            Username: email,
          };

          const { UserAttributes } = await service
            .adminGetUser(cancelIt)
            .promise();
          const filtered = UserAttributes.find(
            (entry) => entry.Name === "email_verified"
          );

          if (filtered.Value === "false") {
            console.log("deleting");
            await service.adminDeleteUser(cancelIt).promise();
            newUser = await service.signUp(params).promise();
          }
        }

        returnObject = { ...newUser };
      }

      break;
    case "PATCH /sign-up":
      const { username, confirmationCode } = JSON.parse(body);
      params = {
        ClientId: process.env.USER_POOL_CLIENT,
        Username: username,
        ConfirmationCode: confirmationCode,
      };
      await service.confirmSignUp(params).promise();
      returnObject = { message: "successfully created" };
  }

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(returnObject),
  };
};
