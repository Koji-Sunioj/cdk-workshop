import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";

import { useContext, useState, useEffect } from "react";
import { globalContext } from "../App";
import { Link, useLocation } from "react-router-dom";

function NavBar({ setFilterToggle, filterToggle }) {
  const [toggleFilterButton, setToggleFilterButton] = useState(false);
  const [login] = useContext(globalContext);
  const currentLocation = useLocation();
  const { pathname } = currentLocation;

  useEffect(() => {
    if (pathname === "/albums") {
      setToggleFilterButton(true);
    } else {
      setToggleFilterButton(false);
    }
  }, [pathname]);

  return (
    <Navbar bg="dark" expand="lg" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Iron Pond Productions
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/albums" state={{ currentLocation }}>
              Photo Albums
            </Nav.Link>
            {login !== null ? (
              <>
                <Nav.Link as={Link} to="/account">
                  My Account
                </Nav.Link>
                <Nav.Link as={Link} to="/create-album">
                  Create album
                </Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/sign-in">
                Sign In
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {toggleFilterButton && (
              <ButtonGroup style={{ width: "200px" }}>
                <ToggleButton
                  variant="outline-success"
                  type="checkbox"
                  checked={filterToggle}
                  onClick={(e) => setFilterToggle(!filterToggle)}
                >
                  Toggle search filter
                </ToggleButton>
              </ButtonGroup>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
