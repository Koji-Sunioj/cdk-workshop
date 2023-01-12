import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";

import { globalContext } from "../App";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { authenticate } from "../utils/api";
import PwInputs from "../components/PwInputs";

function SignIn() {
  const pointer = {
    success: "successfully logged in",
    danger: "mismatch password, or user doesn't exist",
  };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiState, setApiState] = useState(null);
  const [, setLogin] = useContext(globalContext);

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
          setApiState("success");
          localStorage.removeItem("userName");
          localStorage.removeItem("AccessToken");
          localStorage.setItem("userName", email);
          localStorage.setItem("AccessToken", token.AccessToken);
          setTimeout(() => {
            navigate("/");
            setLoading(false);
          }, 1500);
        })();
    } catch {
      setLoading(false);
      setApiState("danger");
    }
  };

  return (
    <>
      <Container>
        <Row>
          <Col lg="5">
            <h2>Sign In</h2>

            <PwInputs handler={signIn} loading={loading} confirmPw={false}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  autoComplete="on"
                />
              </Form.Group>
            </PwInputs>
            <div
              style={{
                paddingTop: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <Link to={"/sign-up"}>Don't have an account yet? Sign up!</Link>
              <Link to={"/forgot-password"}>Forgot password?</Link>
            </div>
            <br />
            <Alert
              show={apiState}
              variant={apiState}
              onClose={() => setApiState(null)}
              dismissible
            >
              {pointer[apiState]}
            </Alert>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default SignIn;
