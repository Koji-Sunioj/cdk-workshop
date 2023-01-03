import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function Features() {
  return (
    <>
      <Container>
        <Row>
          <Col>
            <h2>Features</h2>
            <p>Our features are as follows</p>
            <ul>
              <li>one on one tech support</li>
              <li>fast developement</li>
              <li>friendly staff</li>
              <li>organized planning</li>
            </ul>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Features;
