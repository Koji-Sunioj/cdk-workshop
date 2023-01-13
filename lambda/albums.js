const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({ region: "eu-north-1" });
const { returnHeaders } = require("./utils/headers.js");

exports.handler = async function (event, context) {
  const { httpMethod, resource, pathParameters, body } = event;
  const routeKey = `${httpMethod} ${resource}`;
  const something = process.env.ALBUM_BUCKET_NAME;

  let dbParams = {
    TableName: process.env.ALBUM_TABLE_NAME,
  };

  let returnObject = {};

  let buckParams = {
    Bucket: process.env.ALBUM_BUCKET_NAME,
    Key: "190587680.jpg",
    Expires: 3600,
    ContentType: "image/jpeg",
  };
  let statusCode = 200;

  switch (routeKey) {
    case "GET /albums":
      const s3 = new AWS.S3({ signatureVersion: "v4", region: "eu-north-1" });
      const url = await s3.getSignedUrl("putObject", buckParams);
      returnObject = url;
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
