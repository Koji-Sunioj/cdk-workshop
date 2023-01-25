const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({ region: "eu-north-1" });
const { returnHeaders } = require("./utils/headers.js");
const { verifyToken } = require("./utils/token.js");

exports.handler = async function (event) {
  const {
    httpMethod,
    resource,
    pathParameters,
    body,
    queryStringParameters,
    headers,
  } = event;
  let routeKey = `${httpMethod} ${resource}`;
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
    routeKey = type === "guest" ? "noAuth" : routeKey;
  }

  switch (routeKey) {
    case "noAuth":
      statusCode = 403;
      returnObject = { message: "not allowed to alter resource" };
      break;
    case "GET /albums/init":
      const { key, content_type } = queryStringParameters;
      let buckParams = {
        Bucket: process.env.ALBUM_BUCKET_NAME,
        Key: key,
        Expires: 20,
        ContentType: content_type,
      };

      const url = await s3.getSignedUrl("putObject", buckParams);
      returnObject = { url: url };
      break;
    case "GET /albums/{albumId}":
      ({ albumId } = pathParameters);
      dbParams.Key = { albumId: albumId };
      const { Item: album } = await docClient.get(dbParams).promise();
      returnObject = { album: { ...album } };
      break;
    case "GET /albums":
      const { Items: albums } = await docClient.scan(dbParams).promise();
      returnObject = { albums: albums };
      break;
    case "POST /albums":
      const newAlbum = JSON.parse(body);
      newAlbum.created = new Date().toISOString();
      await docClient
        .put({
          ...dbParams,
          Item: newAlbum,
        })
        .promise();
      returnObject = { ...newAlbum };
      break;
    case "DELETE /albums/{albumId}/{s3Object}":
      ({ albumId, s3Object } = pathParameters);
      bucketParams.Key = `${albumId}/${s3Object.replace(/%20/g, " ")}`;
      await s3.deleteObject(bucketParams).promise();
      returnObject = { message: "successfully deleted" };
      break;

    case "DELETE /albums/{albumId}":
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
      break;
    case "PATCH /albums/{albumId}":
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
