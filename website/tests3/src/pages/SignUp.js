import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useState, useContext } from "react";
import { globalContext } from "../App";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [login, setLogin] = useContext(globalContext);
  const navigate = useNavigate();

  const signUpUrl =
    "https://4xtzbk0sc8.execute-api.eu-north-1.amazonaws.com/prod/sign-up";
  const signInUrl =
    "https://4xtzbk0sc8.execute-api.eu-north-1.amazonaws.com/prod/auth/";

  const [user, setUser] = useState(null);

  const confirmUser = async (event) => {
    console.log("confirmed");
    event.preventDefault();
    const {
      confirmation: { value: confirmationCode },
    } = event.currentTarget;

    const statusCode = await fetch(signUpUrl, {
      method: "PATCH",
      body: JSON.stringify({ ...user, confirmationCode: confirmationCode }),
    }).then((response) => response.status);

    statusCode === 200 &&
      (async () => {
        const { username, password } = user;
        const token = await fetch(signInUrl, {
          method: "POST",
          body: JSON.stringify({
            userName: username,
            password: password,
          }),
        }).then((response) => response.json());

        setLogin({ userName: username, ...token });
        navigate("/");
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
      alert("hey");
    } else {
      await fetch(signUpUrl, {
        method: "POST",
        body: JSON.stringify({ email: email, password: password }),
      }).then((response) => response.json());
      setUser({ username: email, password: password });
      Array.from(document.querySelectorAll("input")).forEach(
        (input) => (input.value = "")
      );
    }
  };

  const resendConfirmation = async () => {
    const { username } = user;
    await fetch(signUpUrl + "?resend=true", {
      method: "POST",
      body: JSON.stringify({ email: username }),
    }).then((response) => response.json());
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
                <Form onSubmit={initialSignUp}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      name="email"
                      autoComplete="on"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      name="password"
                      autoComplete="on"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      placeholder="confirm password"
                      name="confirmPassword"
                      autoComplete="on"
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                </Form>
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
                      defaultValue={""}
                      autoComplete="off"
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                  <Button
                    variant="primary"
                    style={{ marginLeft: "10px" }}
                    onClick={resendConfirmation}
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
