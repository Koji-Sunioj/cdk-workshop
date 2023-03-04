import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";

import { globalContext } from "../App";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { authenticate } from "../utils/signUpApi";

import PwInputs from "../components/PwInputs";
import ContainerRowCol from "../components/ContainerRowCol";

function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [{ type, message }, setMessage] = useState({
    type: null,
    message: null,
  });
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
          setMessage({ type: "success", message: "successfully signed in" });
          localStorage.clear();
          localStorage.setItem("userName", email);
          localStorage.setItem("AccessToken", token.AccessToken);
          setTimeout(() => {
            navigate("/");
          }, 1500);
        })();
    } catch {
      setLoading(false);
      setMessage({
        type: "danger",
        message: "mismatch password, or user doesn't exist",
      });
    }
  };

  return (
    <ContainerRowCol>
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
      <Link className="mb-3" to={"/sign-up"}>
        Don't have an account yet? Sign up!
      </Link>
      <br />
      <Link className="mb-3" to={"/forgot-password"}>
        Forgot password?
      </Link>
      <Alert variant={type}>{message}</Alert>
    </ContainerRowCol>
  );
}

export default SignIn;
