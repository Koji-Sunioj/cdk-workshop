const AWS = require("aws-sdk");
const service = new AWS.CognitoIdentityServiceProvider();

exports.handler = async function (event, context) {
  const { httpMethod, resource, pathParameters, body } = event;
  const routeKey = `${httpMethod} ${resource}`;
  console.log(routeKey);

  let returnObject = {};
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,PATCH",
  };

  let params = {
    UserPoolClient: process.env.USER_POOL_CLIENT,
  };

  switch (routeKey) {
    case "POST /auth":
      returnObject.message = "hey you";
      const { email, password } = JSON.parse(body);
      const shit = {
        ClientId: process.env.USER_POOL_CLIENT,
        Password: password,
        Username: email,
      };
      console.log("before service invoke");
      const hey = await service.signUp(shit).promise();
      console.log(hey);

      break;
  }

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(returnObject),
  };
};
