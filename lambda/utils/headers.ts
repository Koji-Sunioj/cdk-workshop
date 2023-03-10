const returnHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,PATCH",
  "Access-Control-Allow-Credentials": true,
};

module.exports = { returnHeaders };
