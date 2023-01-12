const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({ region: "eu-north-1" });
const { returnHeaders } = require("./utils/headers.js");

exports.handler = async function (event, context) {
  const { httpMethod, resource, pathParameters, body } = event;
  const routeKey = `${httpMethod} ${resource}`;

  let params = {
    TableName: process.env.ALBUM_TABLE_NAME,
  };
  let statusCode = 200;
  let returnObject = {};

  switch (routeKey) {
    case "GET /albums":
      break;
    case "POST /albums":
      break;
    case "DELETE /albums/{albumId}":
      break;
    case "PATCH /albums/{albumId}":
      break;
    case "GET /albums/{albumId}":
      break;
    default:
      statusCode = 404;
      returnObject = { message: "no matching resource" };
  }
  return {
    statusCode: statusCode,
    headers: returnHeaders,
    body: JSON.stringify(returnObject),
  };
};
