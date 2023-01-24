import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/esm/Stack";
import Button from "react-bootstrap/esm/Button";

import { globalContext } from "../App";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { checkPw } from "../utils/checkPw";
import { resetPassword } from "../utils/signUpApi";

import NotFound from "./NotFound";
import PwInputs from "../components/PwInputs";
import ContainerRowCol from "../components/ContainerRowCol";

function Account() {
  const navigate = useNavigate();
  const initMessage = {
    type: null,
    message: null,
  };
  const [{ type, message }, setMessage] = useState(initMessage);
  const [loading, setLoading] = useState(false);
  const [resetFlow, setResetFlow] = useState(false);
  const [login, setLogin] = useContext(globalContext);
  let userName, AccessToken;

  if (login !== null) {
    ({ userName, AccessToken } = login);
  }

  const initiateReset = async (event) => {
    event.preventDefault();
    const {
      password: { value: password },
      confirmPassword: { value: confirmPassword },
    } = event.currentTarget;
    const isInValid = checkPw(password, confirmPassword);

    if (isInValid) {
      setMessage({
        type: "danger",
        message: "mismatch password, or doesn't meet requirements",
      });
    } else {
      setLoading(true);
      const statusCode = await resetPassword({
        userName: userName,
        passWord: password,
        token: AccessToken,
      });
      switch (statusCode) {
        case 200:
          setMessage({
            type: "success",
            message: "successfully reset password",
          });
          break;
        default:
          setMessage({
            type: "danger",
            message: "network error",
          });
      }
      setTimeout(() => {
        setLoading(false);
        setResetFlow(false);
        setMessage(initMessage);
      }, 1500);
    }
  };

  return (
    <>
      {login === null ? (
        <NotFound />
      ) : (
        <ContainerRowCol>
          {resetFlow ? (
            <>
              <h2>Reset password for {userName}</h2>
              <PwInputs handler={initiateReset} loading={loading} />
              <Alert variant={type}>{message}</Alert>
            </>
          ) : (
            <>
              <h2>Welcome {userName}</h2>
              <Stack direction="horizontal" gap={3} className="mb-3">
                <Button
                  onClick={() => {
                    setResetFlow(true);
                  }}
                >
                  Reset Password
                </Button>
                <Button
                  onClick={() => {
                    setMessage({
                      type: "success",
                      message: "successfully logged out",
                    });
                    setTimeout(() => {
                      setLogin(null);
                      localStorage.clear();
                      navigate("/");
                    }, 1500);
                  }}
                >
                  Sign Out
                </Button>
              </Stack>
              <Alert variant={type}>{message}</Alert>
            </>
          )}
        </ContainerRowCol>
      )}
    </>
  );
}

export default Account;
