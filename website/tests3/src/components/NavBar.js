import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

import { useContext } from "react";
import { globalContext } from "../App";
import { Link } from "react-router-dom";

function NavBar() {
  const [login] = useContext(globalContext);
  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Iron Pond Productions
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/features">
              Features
            </Nav.Link>
            <Nav.Link as={Link} to="/pricing">
              Pricing
            </Nav.Link>
            {login !== null ? (
              <Nav.Link as={Link} to="/account">
                My Account
              </Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/sign-in">
                Sign In
              </Nav.Link>
            )}
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}

export default NavBar;
