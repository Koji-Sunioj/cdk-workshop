import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function HomePage() {
  return (
    <>
      <Container>
        <Row>
          <Col>
            <h1>Welcome</h1>
            <p>This is the home page. We make really sturdy Finnish things.</p>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default HomePage;
