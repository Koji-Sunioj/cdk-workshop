const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({ region: "eu-north-1" });

exports.handler = async function (event, context) {
  const { httpMethod, resource, pathParameters, body } = event;
  const routeKey = `${httpMethod} ${resource}`;

  let returnObject = {};
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,PATCH",
  };

  let params = {
    TableName: process.env.ALBUM_TABLE_NAME,
  };

  switch (routeKey) {
    case "GET /albums":
      const { Items: albums } = await docClient.scan(params).promise();
      returnObject = { albums: albums };
      break;
    case "POST /albums":
      ({ title, released, artist } = JSON.parse(body));
      const toBeCreated = {
        title,
        released,
        artist,
        albumId: context.awsRequestId,
      };

      await docClient
        .put({
          ...params,
          Item: toBeCreated,
        })
        .promise();
      returnObject = {
        album: toBeCreated,
        message: "album successfully created",
      };

      break;
    case "DELETE /albums/{albumId}":
      await docClient
        .delete({
          ...params,
          Key: { albumId: pathParameters.albumId },
        })
        .promise();
      returnObject = {
        message: `album ${pathParameters.albumId} successfully deleted`,
      };
      break;
    case "PATCH /albums/{albumId}":
      ({ title, released, artist } = JSON.parse(body));
      const toBeUpdated = {
        title,
        released,
        artist,
        albumId: pathParameters.albumId,
      };

      await docClient
        .update({
          ...params,
          Key: { albumId: pathParameters.albumId },
          UpdateExpression:
            "SET title = :title, artist = :artist, released = :released",
          ExpressionAttributeValues: {
            ":title": title,
            ":released": Number(released),
            ":artist": artist,
          },
        })
        .promise();
      returnObject = {
        album: toBeUpdated,
        message: `album ${pathParameters.albumId} successfully updated`,
      };
      break;
    case "GET /albums/{albumId}":
      const { Item: album } = await docClient
        .get({
          ...params,
          Key: { albumId: pathParameters.albumId },
        })
        .promise();
      returnObject = { album: album };
      break;
  }
  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(returnObject),
  };
};
