import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useState } from "react";

function SignIn() {
  const signInUrl =
    "https://4xtzbk0sc8.execute-api.eu-north-1.amazonaws.com/prod/auth/";

  const [user, setUser] = useState(null);

  const signIn = async (event) => {
    event.preventDefault();
    const {
      email: { value: email },
      password: { value: password },
    } = event.currentTarget;

    const token = await fetch(signInUrl, {
      method: "POST",
      body: JSON.stringify({ userName: email, password: password }),
    }).then((response) => response.json());

    console.log(token);
  };

  return (
    <>
      <Container>
        <Row>
          <Col lg="5">
            <h2>Sign In</h2>
            <Form onSubmit={signIn}>
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
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default SignIn;
