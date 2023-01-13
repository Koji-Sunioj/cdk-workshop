const { CognitoJwtVerifier } = require("aws-jwt-verify");

const verifyToken = async (headers) => {
  const token = String(headers.Authorization).split(" ")[1];
  console.log(process.env.USER_POOL_ID);
  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    tokenUse: "access",
    clientId: process.env.USER_POOL_CLIENT,
  });

  try {
    await verifier.verify(token);
    return { type: "user" };
  } catch {
    return { type: "guest" };
  }
};

module.exports = { verifyToken };
