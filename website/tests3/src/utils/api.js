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

export const resendConfirmation = async (userName) => {
  await fetch(authUrl + "sign-up/" + userName, { method: "HEAD" });
};

export const forgotPassword = async (userName) => {
  const statusCode = await fetch(authUrl + "auth/" + userName, {
    method: "HEAD",
  }).then((response) => response.status);
  return statusCode;
};

export const confirmForgotResetPassword = async (emailPwdConf) => {
  const { userName, passWord, confirmationCode } = emailPwdConf;
  const statusCode = await fetch(
    authUrl + "auth/" + userName + "?confirmForgot=true",
    {
      method: "PATCH",
      body: JSON.stringify({
        password: passWord,
        confirmationCode: confirmationCode,
      }),
    }
  ).then((response) => response.status);
  return statusCode;
};

// need:
// forgot password
// ui for waiting for confirmation
// sign out?
// reset password
