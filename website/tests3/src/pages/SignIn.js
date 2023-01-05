import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

import { globalContext } from "../App";
import { authenticate } from "../utils/api";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function SignIn() {
  const [loading, setLoading] = useState(false);
  const [, setLogin] = useContext(globalContext);
  const navigate = useNavigate();

  const signIn = async (event) => {
    setLoading(true);
    event.preventDefault();
    const {
      email: { value: email },
      password: { value: password },
    } = event.currentTarget;
    try {
      const token = await authenticate({ userName: email, password: password });

      token.hasOwnProperty("AccessToken") &&
        (() => {
          setLogin({ userName: email, ...token });
          localStorage.setItem("userName", email);
          localStorage.setItem("AccessToken", token.AccessToken);
          navigate("/");
          setLoading(false);
        })();
    } catch {
      alert("there was an error");
    }
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
              <Button variant="primary" type="submit" disabled={loading}>
                Submit
              </Button>
            </Form>
            <br />
            <Link to={"/sign-up"}>Don't have an account yet? Sign up!</Link>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default SignIn;
