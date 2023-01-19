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
  let type, albumId, s3Object;
  const s3 = new AWS.S3({ signatureVersion: "v4", region: "eu-north-1" });
  let dbParams = {
    TableName: process.env.ALBUM_TABLE_NAME,
  };
  let bucketParams = {
    Bucket: process.env.ALBUM_BUCKET_NAME,
  };

  const needsPermission = [
    "POST /albums",
    "DELETE /albums/{albumId}",
    "PATCH /albums/{albumId}",
    "GET /albums/init",
    "DELETE /albums/{albumId}/{s3Object}",
  ];

  if (needsPermission.includes(routeKey)) {
    ({ type } = await verifyToken(headers));
  }

  switch (routeKey) {
    case "GET /albums/init":
      if (type === "user") {
        const { key, content_type } = queryStringParameters;
        let buckParams = {
          Bucket: process.env.ALBUM_BUCKET_NAME,
          Key: key,
          Expires: 20,
          ContentType: content_type,
        };

        const url = await s3.getSignedUrl("putObject", buckParams);
        returnObject = { url: url };
      } else {
        statusCode = 403;
      }
      returnObject;
      break;
    case "GET /albums/{albumId}":
      ({ albumId } = pathParameters);
      const { Item: album } = await docClient
        .get({
          ...dbParams,
          Key: { albumId: albumId },
        })
        .promise();
      returnObject = { album: { ...album } };
      break;
    case "GET /albums":
      const { Items: albums } = await docClient.scan(dbParams).promise();
      returnObject = { albums: albums };
      break;
    case "POST /albums":
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
    case "DELETE /albums/{albumId}/{s3Object}":
      ({ albumId, s3Object } = pathParameters);
      if (type === "user") {
        bucketParams.Key = `${albumId}/${s3Object.replace(/%20/g, " ")}`;
        await s3.deleteObject(bucketParams).promise();
        returnObject = { message: "successfully deleted" };
      } else {
        statusCode = 403;
      }
      break;

    case "DELETE /albums/{albumId}":
      if (type === "user") {
        ({ albumId } = pathParameters);
        bucketParams.Prefix = `${albumId}/`;
        const { Contents } = await s3.listObjects(bucketParams).promise();
        const keys = Contents.map((item) => {
          const toDelete = { Key: item.Key };
          return toDelete;
        });
        const deleteParams = {
          Bucket: process.env.ALBUM_BUCKET_NAME,
          Delete: {
            Objects: keys,
          },
        };
        await s3.deleteObjects(deleteParams).promise();
        await docClient
          .delete({
            ...dbParams,
            Key: { albumId: albumId },
          })
          .promise();
        returnObject = { message: "items deleted" };
      } else {
        statusCode = 403;
      }
      break;
    case "PATCH /albums/{albumId}":
      if (type === "user") {
        ({ albumId } = pathParameters);
        const { photos, tags, title } = JSON.parse(body);
        await docClient
          .update({
            ...dbParams,
            Key: { albumId: albumId },
            UpdateExpression:
              "SET photos = :photos, title = :title, tags = :tags",
            ExpressionAttributeValues: {
              ":photos": photos,
              ":title": title,
              ":tags": tags,
            },
          })
          .promise();
        returnObject = { message: "success" };
      } else {
        statusCode = 403;
      }
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
