import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/esm/Stack";

import { globalContext } from "../App";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { authenticate } from "../utils/signUpApi";
import { signInPointer } from "../utils/pointers";

import PwInputs from "../components/PwInputs";
import ContainerRowCol from "../components/ContainerRowCol";

function SignIn() {
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
          localStorage.clear();
          localStorage.setItem("userName", email);
          localStorage.setItem("AccessToken", token.AccessToken);
          setTimeout(() => {
            navigate("/");
          }, 1500);
        })();
    } catch {
      setLoading(false);
      setApiState("danger");
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
      <Stack direction="horizontal" gap={3}>
        <Link to={"/sign-up"}>Don't have an account yet? Sign up!</Link>
        <Link to={"/forgot-password"}>Forgot password?</Link>
      </Stack>
      <br />
      <Alert
        show={apiState}
        variant={apiState}
        onClose={() => setApiState(null)}
        dismissible
      >
        {signInPointer[apiState]}
      </Alert>
    </ContainerRowCol>
  );
}

export default SignIn;
