import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/Container";
import NotFound from "./NotFound";

import { globalContext } from "../App";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { resetPassword } from "../utils/signUpApi";
import PwInputs from "../components/PwInputs";

function Account() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetFlow, setResetFlow] = useState(false);
  const [login, setLogin] = useContext(globalContext);
  let userName, AccessToken;

  if (login !== null) {
    ({ userName, AccessToken } = login);
  }

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
        token: AccessToken,
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
      {login === null ? (
        <NotFound />
      ) : (
        <Container>
          <Row>
            <Col lg="5">
              {resetFlow ? (
                <>
                  <h2>Reset password for {userName}</h2>
                  <PwInputs handler={initiateReset} loading={loading} />
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
      )}
    </>
  );
}

export default Account;
