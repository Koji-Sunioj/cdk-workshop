import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";

function Prices() {
  return (
    <>
      <Container>
        <Row>
          <Col>
            <h2>Server prices</h2>
            <p>Our prices are as follows</p>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Linux Servers</th>
                  <th>Price / month</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>$15</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>$24</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>$30</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Prices;
