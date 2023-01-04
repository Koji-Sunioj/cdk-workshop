import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

function SignUp() {
  const InitialSignUp = async (event) => {
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
      fetch(
        "https://4xtzbk0sc8.execute-api.eu-north-1.amazonaws.com/prod/auth",
        {
          method: "POST",
          body: JSON.stringify({ email: email, password: password }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        });
    }
  };

  return (
    <>
      <Container>
        <Row>
          <Col lg="5">
            <h2>Sign Up</h2>
            <Form onSubmit={InitialSignUp}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  name="password"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Control
                  type="password"
                  placeholder="confirm password"
                  name="confirmPassword"
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

export default SignUp;
