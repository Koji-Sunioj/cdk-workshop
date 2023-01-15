const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({ region: "eu-north-1" });
const { returnHeaders } = require("./utils/headers.js");
const { verifyToken } = require("./utils/token.js");

exports.handler = async function (event, context) {
  const {
    httpMethod,
    resource,
    pathParameters,
    body,
    queryStringParameters,
    headers,
  } = event;
  const routeKey = `${httpMethod} ${resource}`;
  let returnObject = {};
  let statusCode = 200;
  let type;

  let dbParams = {
    TableName: process.env.ALBUM_TABLE_NAME,
  };
  console.log(routeKey);

  switch (routeKey) {
    case "GET /albums/init":
      ({ type } = await verifyToken(headers));
      if (type === "user") {
        const { key, content_type } = queryStringParameters;
        let buckParams = {
          Bucket: process.env.ALBUM_BUCKET_NAME,
          Key: key,
          Expires: 20,
          ContentType: content_type,
        };
        const s3 = new AWS.S3({ signatureVersion: "v4", region: "eu-north-1" });
        const url = await s3.getSignedUrl("putObject", buckParams);
        returnObject = { url: url };
      } else {
        statusCode = 403;
      }
      returnObject;
      break;
    case "GET /albums":
      const { Items: albums } = await docClient.scan(dbParams).promise();
      returnObject = { albums: albums };
      break;
    case "POST /albums":
      ({ type } = await verifyToken(headers));
      if (type === "user") {
        const newAlbum = JSON.parse(body);
        newAlbum.created = new Date().toISOString();
        await docClient
          .put({
            ...dbParams,
            Item: newAlbum,
          })
          .promise();
        returnObject = { ...newAlbum };
      } else {
        statusCode = 403;
      }
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
