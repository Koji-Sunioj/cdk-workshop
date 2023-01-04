import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function NotFound() {
  return (
    <>
      <Container>
        <Row>
          <Col>
            <h2>No matching resource</h2>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default NotFound;
