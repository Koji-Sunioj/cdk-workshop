import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import { globalContext } from "../App";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../utils/api";

function Account() {
  const navigate = useNavigate();
  const [login, setLogin] = useContext(globalContext);
  const [resetFlow, setResetFlow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userName } = login;

  const initiateReset = async (event) => {
    event.preventDefault();
    const {
      password: { value: password },
      confirmPassword: { value: confirmPassword },
    } = event.currentTarget;

    const pattern = /(?=.*[a-z])(?=[A-Z]{1})/;
    const isInValid =
      password !== confirmPassword ||
      password.length < 8 ||
      !pattern.test(password);

    if (isInValid) {
      alert("hey");
    } else {
      setLoading(true);
      const statusCode = await resetPassword({
        userName: userName,
        passWord: password,
      });
      switch (statusCode) {
        case 200:
          alert("successfully changed password");
          break;
        default:
          alert("there was an error");
      }
      setLoading(false);
      setResetFlow(false);
    }
  };

  return (
    <>
      <Container>
        <Row>
          <Col lg="5">
            {resetFlow ? (
              <>
                <h2>Reset password for {userName}</h2>
                <Form onSubmit={initiateReset}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      name="password"
                      autoComplete="on"
                      disabled={loading}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      placeholder="confirm password"
                      name="confirmPassword"
                      autoComplete="on"
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">
                      Password should be over seven characters and have at least
                      one uppercase letter
                    </Form.Text>
                  </Form.Group>

                  <Button variant="primary" type="submit" disabled={loading}>
                    Submit
                  </Button>
                </Form>
              </>
            ) : (
              <>
                <h2>Welcome {userName}</h2>
                <div
                  style={{
                    paddingTop: "10px",
                    display: "flex",
                    flexDirection: "row",
                    gap: "10px",
                  }}
                >
                  <Button
                    onClick={() => {
                      setResetFlow(true);
                    }}
                  >
                    Reset Password
                  </Button>
                  <Button
                    onClick={() => {
                      setLogin(null);
                      localStorage.removeItem("userName");
                      localStorage.removeItem("AccessToken");
                      alert("successfully logged out");
                      navigate("/");
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Account;
