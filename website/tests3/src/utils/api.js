const authUrl = "https://4xtzbk0sc8.execute-api.eu-north-1.amazonaws.com/prod/";

export const authenticate = async (login) => {
  const token = await fetch(authUrl + "auth", {
    method: "POST",
    body: JSON.stringify(login),
  }).then((response) => response.json());
  return token;
};

export const signUp = async (emailPwd) => {
  const statusCode = await fetch(authUrl + "sign-up", {
    method: "POST",
    body: JSON.stringify(emailPwd),
  }).then((response) => response.status);
  return statusCode;
};

export const confirmSignUp = async (emailConf) => {
  const statusCode = await fetch(authUrl + "sign-up", {
    method: "PATCH",
    body: JSON.stringify(emailConf),
  }).then((response) => response.status);
  return statusCode;
};

export const resendConfirmation = async (username) => {
  await fetch(authUrl + "sign-up?resend=true", {
    method: "POST",
    body: JSON.stringify({ email: username }),
  });
};

// need:
// forgot password
// ui for waiting for confirmation
// sign out?
// reset password
