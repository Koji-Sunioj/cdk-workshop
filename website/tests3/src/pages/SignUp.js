import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

import { globalContext } from "../App";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
  authenticate,
  signUp,
  confirmSignUp,
  resendConfirmation,
} from "../utils/signUpApi";
import { checkPw } from "../utils/checkPw";

import PwInputs from "../components/PwInputs";
import ContainerRowCol from "../components/ContainerRowCol";

function SignUp() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [{ type, message }, setMessage] = useState({
    type: null,
    message: null,
  });
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useContext(globalContext);

  const confirmUser = async (event) => {
    setLoading(true);
    event.preventDefault();
    const {
      confirmation: { value: confirmationCode },
    } = event.currentTarget;

    try {
      await confirmSignUp({
        ...user,
        confirmationCode: confirmationCode,
      });
      const { userName, password } = user;
      const token = await authenticate({
        userName: userName,
        password: password,
      });

      setMessage({
        type: "success",
        message: "successfully created account",
      });
      setTimeout(() => {
        localStorage.setItem("userName", userName);
        localStorage.setItem("AccessToken", token.AccessToken);
        setLogin({ userName: userName, ...token });
        navigate("/");
        setLoading(false);
      }, 1500);
    } catch {
      setMessage({
        type: "danger",
        message: "incorrect code",
      });
      setLoading(false);
    }
  };

  const initialSignUp = async (event) => {
    event.preventDefault();
    const {
      email: { value: email },
      password: { value: password },
      confirmPassword: { value: confirmPassword },
    } = event.currentTarget;
    const isInValid = checkPw(password, confirmPassword);
    const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (isInValid || !emailPattern.test(email)) {
      setMessage({
        type: "danger",
        message: "mismatch password, or doesn't meet requirements",
      });
    } else {
      setLoading(true);
      const statusCode = await signUp({ email: email, password: password });
      switch (statusCode) {
        case 200:
          setMessage({ type: null, message: null });
          setUser({ userName: email, password: password });
          Array.from(document.querySelectorAll("input")).forEach(
            (input) => (input.value = "")
          );
          break;
        case 409:
          setMessage({
            type: "danger",
            message: "user already exists",
          });
          break;
        case 403:
          setMessage({
            type: "danger",
            message: "not on current guest list",
          });
          break;
        default:
      }
      setLoading(false);
    }
  };

  const resend = async () => {
    setLoading(true);
    const { userName } = user;
    await resendConfirmation(userName);
    setLoading(false);
  };

  return (
    <ContainerRowCol>
      {login !== null && <h2>You are already signed in</h2>}
      {user === null ? (
        <>
          <h2>Sign Up</h2>
          <PwInputs handler={initialSignUp} loading={loading}>
            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                autoComplete="on"
              />
            </Form.Group>
          </PwInputs>
          {type === "danger" && <Alert variant="danger">{message}</Alert>}
        </>
      ) : (
        <>
          <h2>Confirm Sign Up</h2>
          <p>check your email for the confirmation code</p>
          <Form onSubmit={confirmUser} className="mb-3">
            <Form.Group className="mb-3">
              <Form.Control
                placeholder="confirmation code"
                name="confirmation"
                autoComplete="off"
                disabled={loading}
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading}>
              Submit
            </Button>
            <Button
              disabled={loading}
              variant="primary"
              style={{ marginLeft: "10px" }}
              onClick={resend}
            >
              Resend Code
            </Button>
          </Form>
          <Alert variant={type}>{message}</Alert>
        </>
      )}
    </ContainerRowCol>
  );
}

export default SignUp;
