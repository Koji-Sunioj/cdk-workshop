const AWS = require("aws-sdk");
const service = new AWS.CognitoIdentityServiceProvider();

exports.handler = async function (event) {
  console.log("hit");
  const { httpMethod, resource, pathParameters, body } = event;
  const routeKey = `${httpMethod} ${resource}`;

  console.log(routeKey);

  let params;
  let returnObject = {};
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,PATCH",
  };

  switch (routeKey) {
    case "POST /auth":
      returnObject = { ...JSON.parse(body) };
      break;

    case "POST /sign-up":
      const { email, password } = JSON.parse(body);
      params = {
        ClientId: process.env.USER_POOL_CLIENT,
        Password: password,
        Username: email,
      };
      const newUser = await service.signUp(params).promise();
      returnObject = { ...newUser };
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
