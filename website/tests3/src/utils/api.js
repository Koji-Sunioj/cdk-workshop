import apiUrls from "../apis.json";

const { AuthUrl, SignUpUrl } = apiUrls.CdkWorkshopStack;

//const authUrl = "https://4xtzbk0sc8.execute-api.eu-north-1.amazonaws.com/prod/";

export const authenticate = async (login) => {
  const token = await fetch(AuthUrl, {
    method: "POST",
    body: JSON.stringify(login),
  }).then((response) => response.json());
  return token;
};

export const signUp = async (emailPwd) => {
  const statusCode = await fetch(SignUpUrl, {
    method: "POST",
    body: JSON.stringify(emailPwd),
  }).then((response) => response.status);
  return statusCode;
};

export const confirmSignUp = async (emailConf) => {
  const statusCode = await fetch(SignUpUrl, {
    method: "PATCH",
    body: JSON.stringify(emailConf),
  }).then((response) => response.status);
  return statusCode;
};

export const resendConfirmation = async (userName) => {
  await fetch(SignUpUrl + userName, { method: "HEAD" });
};

export const forgotPassword = async (userName) => {
  const statusCode = await fetch(AuthUrl + userName, {
    method: "HEAD",
  }).then((response) => response.status);
  return statusCode;
};

export const confirmForgotResetPassword = async (emailPwdConf) => {
  const { userName, passWord, confirmationCode } = emailPwdConf;
  const statusCode = await fetch(AuthUrl + userName + "?task=forgot", {
    method: "PATCH",
    body: JSON.stringify({
      password: passWord,
      confirmationCode: confirmationCode,
    }),
  }).then((response) => response.status);
  return statusCode;
};

export const resetPassword = async (emailPwd) => {
  const { userName, passWord } = emailPwd;
  const statusCode = await fetch(AuthUrl + userName + "?task=reset", {
    method: "PATCH",
    body: JSON.stringify({
      password: passWord,
    }),
  }).then((response) => response.status);
  return statusCode;
};
