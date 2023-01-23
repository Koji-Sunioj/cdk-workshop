import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const PwInputs = ({ handler, loading, children, confirmPw = true }) => {
  return (
    <>
      <Form onSubmit={handler} className="mb-3">
        <fieldset disabled={loading}>
          {children}
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Password"
              name="password"
              autoComplete="on"
            />
          </Form.Group>
          {confirmPw && (
            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder="confirm password"
                name="confirmPassword"
                autoComplete="on"
              />

              <Form.Text className="text-muted">
                Password should be over seven characters and have at least one
                uppercase letter
              </Form.Text>
            </Form.Group>
          )}
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </fieldset>
      </Form>
    </>
  );
};

export default PwInputs;
