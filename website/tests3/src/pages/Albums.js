import { useContext } from "react";
import { Link } from "react-router-dom";
import { globalContext } from "../App";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";

const Albums = () => {
  const [login] = useContext(globalContext);
  console.log(login);
  return (
    <>
      <Container>
        <Row>
          <Col>
            <h2>Browse Photo Albums</h2>
            {login !== null && (
              <Link to={"/create-album"}>Create a new photo album</Link>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Albums;
