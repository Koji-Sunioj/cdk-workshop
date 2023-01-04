import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useState } from "react";

function SignUp() {
  const signUpUrl =
    "https://4xtzbk0sc8.execute-api.eu-north-1.amazonaws.com/prod/sign-up";

  const [user, setUser] = useState(null);
  console.log(user);

  const confirmUser = async (event) => {
    event.preventDefault();
    const {
      confirmation: { value: confirmationCode },
    } = event.currentTarget;

    const something = await fetch(signUpUrl, {
      method: "PATCH",
      body: JSON.stringify({ ...user, confirmationCode: confirmationCode }),
    }).then((response) => response.json());
    console.log(something);
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
      const newUser = await fetch(signUpUrl, {
        method: "POST",
        body: JSON.stringify({ email: email, password: password }),
      }).then((response) => response.json());
      setUser({ username: email });
    }
  };

  return (
    <>
      <Container>
        <Row>
          <Col lg="5">
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
                <Form onSubmit={confirmUser}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      placeholder="confirmation code"
                      name="confirmation"
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Submit
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
