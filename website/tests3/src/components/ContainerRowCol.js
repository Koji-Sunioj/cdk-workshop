import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";

const ContainerRowCol = ({ children }) => {
  return (
    <Container>
      <Row>
        <Col lg="5">{children}</Col>
      </Row>
    </Container>
  );
};

export default ContainerRowCol;
