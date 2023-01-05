import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { globalContext } from "../App";
import { Link } from "react-router-dom";

function SignIn() {
  const [login, setLogin] = useContext(globalContext);
  const navigate = useNavigate();

  const signInUrl =
    "https://4xtzbk0sc8.execute-api.eu-north-1.amazonaws.com/prod/auth/";

  const signIn = async (event) => {
    event.preventDefault();
    const {
      email: { value: email },
      password: { value: password },
    } = event.currentTarget;
    try {
      const token = await fetch(signInUrl, {
        method: "POST",
        body: JSON.stringify({ userName: email, password: password }),
      }).then((response) => response.json());

      setLogin({ userName: email, ...token });
      console.log(token);

      token.hasOwnProperty("AccessToken") &&
        (() => {
          localStorage.setItem("userName", email);
          localStorage.setItem("AccessToken", token.AccessToken);
          navigate("/");
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
              <Button variant="primary" type="submit">
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
