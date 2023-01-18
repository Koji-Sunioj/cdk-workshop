import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

import { globalContext } from "../App";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
  authenticate,
  signUp,
  confirmSignUp,
  resendConfirmation,
} from "../utils/signUpApi";
import PwInputs from "../components/PwInputs";

function SignUp() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useContext(globalContext);

  const confirmUser = async (event) => {
    setLoading(true);
    event.preventDefault();
    const {
      confirmation: { value: confirmationCode },
    } = event.currentTarget;
    const statusCode = await confirmSignUp({
      ...user,
      confirmationCode: confirmationCode,
    });
    statusCode === 200 &&
      (async () => {
        const { userName, password } = user;
        const token = await authenticate({
          userName: userName,
          password: password,
        });
        localStorage.setItem("userName", userName);
        localStorage.setItem("AccessToken", token.AccessToken);

        setLogin({ userName: userName, ...token });
        navigate("/");
        setLoading(false);
      })();
  };

  const initialSignUp = async (event) => {
    event.preventDefault();
    const {
      email: { value: email },
      password: { value: password },
      confirmPassword: { value: confirmPassword },
    } = event.currentTarget;
    const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    const isInValid =
      password !== confirmPassword ||
      !pattern.test(email) ||
      password.length < 8 ||
      confirmPassword < 8;

    if (isInValid) {
      alert("passwords are not the same, or do not meet requirements");
    } else {
      setLoading(true);
      const statusCode = await signUp({ email: email, password: password });
      switch (statusCode) {
        case 200:
          setUser({ userName: email, password: password });
          Array.from(document.querySelectorAll("input")).forEach(
            (input) => (input.value = "")
          );

          break;
        case 409:
          alert("user already exists");
          break;
        default:
          alert("there was an error");
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
    <>
      <Container>
        <Row>
          <Col lg="5">
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
              </>
            ) : (
              <>
                <h2>Confirm Sign Up</h2>
                <p>check your email for the confirmation code</p>
                <Form onSubmit={confirmUser}>
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
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default SignUp;
