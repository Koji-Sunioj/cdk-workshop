export const checkPw = (password, confirmPassword) => {
  const pattern = /(?=.*[a-z])(?=[A-Z]{1})/;
  const isInValid =
    password !== confirmPassword ||
    password.length < 8 ||
    !pattern.test(password);
  return isInValid;
};
