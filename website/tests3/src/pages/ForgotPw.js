import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/esm/Button";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { checkPw } from "../utils/checkPw";
import { forgotPassword, confirmForgotResetPassword } from "../utils/signUpApi";

import PwInputs from "../components/PwInputs";
import ContainerRowCol from "../components/ContainerRowCol";

function ForgotPw() {
  const navigate = useNavigate();
  const [pwFlow, setPwFlow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [{ type, message }, setMessage] = useState({
    type: null,
    message: null,
  });
  const [userName, setUserName] = useState(null);

  const sendResetCode = async (event) => {
    setLoading(true);
    event.preventDefault();
    const {
      email: { value: email },
    } = event.currentTarget;
    try {
      await forgotPassword(email);
      setUserName(email);
      setPwFlow(true);
      Array.from(document.querySelectorAll("input")).forEach(
        (input) => (input.value = "")
      );
    } catch {
      setMessage("danger");
    }
    setLoading(false);
  };

  const confirmReset = async (event) => {
    setLoading(true);
    event.preventDefault();
    const {
      password: { value: password },
      confirmPassword: { value: confirmPassword },
      confirmation: { value: confirmationCode },
    } = event.currentTarget;
    const isInValid = checkPw(password, confirmPassword);

    if (isInValid) {
      setMessage({
        type: "danger",
        message: "mismatch password, or doesn't meet requirements",
      });
      setLoading(false);
    } else {
      try {
        await confirmForgotResetPassword({
          userName: userName,
          passWord: password,
          confirmationCode: confirmationCode,
        });
        setMessage({ type: "success", message: "successfully reset password" });
        setTimeout(() => {
          navigate("/sign-in");
        }, 1500);
      } catch {
        setMessage({
          type: "danger",
          message: "invalid token or user already exists",
        });
        setLoading(false);
      }
    }
  };

  return (
    <ContainerRowCol>
      {pwFlow ? (
        <>
          <h2>Confirm new password</h2>
          <PwInputs handler={confirmReset} loading={loading}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="confirmation code"
                name="confirmation"
                autoComplete="off"
              />
            </Form.Group>
          </PwInputs>
          <Alert variant={type}>{message}</Alert>
        </>
      ) : (
        <>
          <h2>Reset Password</h2>
          <Form onSubmit={sendResetCode} className="mb-3">
            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                autoComplete="on"
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading}>
              Submit
            </Button>
          </Form>
          <Alert variant={type}>{message}</Alert>
        </>
      )}
    </ContainerRowCol>
  );
}

export default ForgotPw;
