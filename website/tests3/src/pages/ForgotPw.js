import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/esm/Button";
import { forgotPassword, confirmForgotResetPassword } from "../utils/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPw() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pwFlow, setPwFlow] = useState(false);
  const [userName, setUserName] = useState(null);

  const sendNewPw = async (event) => {
    setLoading(true);
    event.preventDefault();
    const {
      email: { value: email },
    } = event.currentTarget;
    const statusCode = await forgotPassword(email);
    switch (statusCode) {
      case 200:
        setUserName(email);
        setPwFlow(true);
        Array.from(document.querySelectorAll("input")).forEach(
          (input) => (input.value = "")
        );
        break;
      default:
        alert("there was a problem");
    }
    setLoading(false);
  };

  const sendNewPw2 = async (event) => {
    setLoading(true);
    event.preventDefault();
    const {
      password: { value: password },
      confirmPassword: { value: confirmPassword },
      confirmation: { value: confirmationCode },
    } = event.currentTarget;
    //console.log(password, confirmPassword, confirmationCode);
    const statusCode = await confirmForgotResetPassword({
      userName: userName,
      passWord: password,
      confirmationCode: confirmationCode,
    });

    switch (statusCode) {
      case 200:
        alert("success");
        navigate("/sign-in");
        break;
      default:
        alert("there was a problem");
    }
    setLoading(false);
  };

  return (
    <>
      <Container>
        <Row>
          <Col lg="5">
            {pwFlow ? (
              <>
                <h2>Confirm new password</h2>
                <Form onSubmit={sendNewPw2}>
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
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="confirmation code"
                      name="confirmation"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={loading}>
                    Submit
                  </Button>
                </Form>
              </>
            ) : (
              <>
                <h2>Reset Password</h2>
                <Form onSubmit={sendNewPw}>
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
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ForgotPw;
