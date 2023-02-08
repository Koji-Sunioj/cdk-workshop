import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Pagination from "react-bootstrap/Pagination";
import InputGroup from "react-bootstrap/InputGroup";

import moment from "moment";
import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";

import { getAlbums } from "../utils/albumApi";
import CardSkeleton from "../components/CardSkeleton";

const Albums = () => {
  const queryRef = useRef();
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [albums, setAlbums] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);

  const queryParams = {
    page: Number(searchParams.get("page")) || 1,
    direction: searchParams.get("direction") || "descending",
    sort: searchParams.get("sort") || "created",
  };
  let query = searchParams.get("query") || "";
  let pathname = null;
  if (query.length > 0) {
    queryParams.query = query;
  }
  if (state !== null && state.hasOwnProperty("currentLocation")) {
    ({
      currentLocation: { pathname },
    } = state);
  }

  useEffect(() => {
    if (albums === null || pathname === "/albums") {
      document.getElementById("filter").value = query;
      setSearchParams(queryParams);
      setLoading(true);
      fetchAlbums();
    } else {
      setLoading(false);
    }
  }, [albums, pathname]);

  const fetchAlbums = async () => {
    const { albums, pages: fetchedPages } = await getAlbums(queryParams);
    const realPages = new Array(Number(fetchedPages))
      .fill(null)
      .map((v, n) => n + 1);
    setAlbums(albums);

    if (realPages.length !== pages.length) {
      setPages(realPages);
    }
  };

  const shouldRender = albums !== null && albums.length > 0;
  const { page, direction, sort } = queryParams;

  const mutateParams = (fields) => {
    fields.forEach((value) => {
      queryParams[value.field] = value.value;
    });
    setSearchParams(queryParams);
    setAlbums(null);
  };

  return (
    <>
      <Container>
        <Row className="mb-3">
          <Col>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                const {
                  filter: { value: filter },
                } = e.currentTarget;
                mutateParams([
                  { field: "query", value: filter },
                  { field: "page", value: 1 },
                ]);
              }}
            >
              <Form.Label>Search</Form.Label>
              <InputGroup className="mb-3">
                <Button
                  ref={queryRef}
                  disabled={query.length === 0}
                  type="submit"
                >
                  Go
                </Button>
                <Form.Control
                  name="filter"
                  id="filter"
                  type="text"
                  placeholder="title, username, tags..."
                  defaultValue={query}
                  onChange={(e) => {
                    const {
                      currentTarget: { value },
                    } = e;
                    if (value.length === 0) {
                      delete queryParams.query;
                      queryRef.current.setAttribute("disabled", true);
                      mutateParams([{ field: "page", value: 1 }]);
                    } else {
                      queryRef.current.removeAttribute("disabled");
                    }
                  }}
                />
              </InputGroup>
            </Form>
          </Col>
          <Col>
            <Form.Label>Sort by</Form.Label>
            <Form.Select
              value={sort}
              onChange={(e) => {
                mutateParams([{ field: "sort", value: e.currentTarget.value }]);
              }}
            >
              {["created", "title", "userName"].map((field) => (
                <option key={field} value={field}>
                  {field.toLocaleLowerCase()}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col>
            <Form.Label>Direction</Form.Label>
            <Form.Select
              value={direction}
              onChange={(e) => {
                mutateParams([
                  { field: "direction", value: e.currentTarget.value },
                ]);
              }}
            >
              {["descending", "ascending"].map((field) => (
                <option key={field} value={field}>
                  {field.toLocaleLowerCase()}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {loading &&
          [1, 2].map((value) => (
            <Row key={value}>
              {[1, 2, 3].map((row) => (
                <Col lg={4} key={row}>
                  <CardSkeleton />
                </Col>
              ))}
            </Row>
          ))}
        {albums !== null && albums.length === 0 && (
          <h3>No Albums match that query</h3>
        )}
        {shouldRender &&
          [0, 3].map((value) => (
            <Row key={value}>
              {albums.slice(value, value + 3).map((album) => {
                const photos = album.photos.sort((a, b) =>
                  a.order > b.order ? 1 : b.order > a.order ? -1 : 0
                );
                const { albumId, title, tags, userName } = album;
                const created = moment(album.created).format(
                  "MMMM Do YYYY, H:mm"
                );

                return (
                  <Col lg={4} key={albumId}>
                    <Card className="mb-3">
                      <Card.Img
                        variant="top"
                        src={photos[0].url}
                        className="album-img"
                      />
                      <Card.Body>
                        <Link to={`${albumId}`}>
                          <Card.Title>{title}</Card.Title>
                        </Link>
                        <Card.Subtitle className="mb-2 text-muted">
                          {created}
                        </Card.Subtitle>
                        <Card.Text>
                          {photos.length}{" "}
                          {photos.length === 1 ? "photo " : "photos "}
                          by {userName}
                        </Card.Text>
                        {tags.map((tag) => (
                          <Button
                            variant="info"
                            key={tag}
                            style={{ margin: "3px" }}
                            onClick={() => {
                              mutateParams([
                                { field: "query", value: tag },
                                { field: "page", value: 1 },
                              ]);
                            }}
                          >
                            {tag}
                          </Button>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ))}
        <Pagination>
          {pages.length > 0 &&
            pages.map((number) => (
              <Pagination.Item
                key={number}
                active={number === page}
                onClick={() => {
                  mutateParams([{ field: "page", value: number }]);
                  window.scrollTo(0, 0);
                }}
              >
                {number}
              </Pagination.Item>
            ))}
        </Pagination>
      </Container>
    </>
  );
};

export default Albums;
