import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
// import { useEffect } from "react";

function HomePage() {
  // useEffect(() => {
  //   // fetch("https://0uw19azc75.execute-api.eu-north-1.amazonaws.com/prod/albums")
  //   //   .then((response) => response.json())
  //   //   .then((data) => {
  //   //     console.log(data);
  //   //   });
  // }, []);

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
