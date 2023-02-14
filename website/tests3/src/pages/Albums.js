import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Container from "react-bootstrap/Container";
import Pagination from "react-bootstrap/Pagination";
import InputGroup from "react-bootstrap/InputGroup";

import moment from "moment";
import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";

import { getAlbums } from "../utils/albumApi";
import CardSkeleton from "../components/CardSkeleton";

const Albums = ({ filterToggle }) => {
  const queryRef = useRef();
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pages, setPages] = useState([]);
  const [albums, setAlbums] = useState(null);
  const [loading, setLoading] = useState(false);
  const [getting, setGetting] = useState(false);
  const [fetchFlag, setFetchFlag] = useState("init");

  const queryParams = {
    page: Number(searchParams.get("page")) || 1,
    direction: searchParams.get("direction") || "descending",
    sort: searchParams.get("sort") || "created",
    type: searchParams.get("type") || "text",
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
    document.getElementById("filter").value = query;
    if (albums === null && fetchFlag === "init") {
      setLoading(true);
      fetchAlbums();
    } else if (fetchFlag === "get" || pathname === "/albums") {
      setGetting(true);
      setSearchParams(queryParams);
      fetchAlbums();
    } else {
      setSearchParams(queryParams);
      setLoading(false);
      setTimeout(() => {
        setGetting(false);
      }, 250);
    }
  }, [albums, fetchFlag, pathname]);

  const fetchAlbums = async () => {
    console.log("api");
    const { albums, pages: fetchedPages } = await getAlbums(queryParams);
    const realPages = new Array(Number(fetchedPages))
      .fill(null)
      .map((v, n) => n + 1);
    setAlbums(albums);
    if (realPages.length !== pages.length) {
      setPages(realPages);
    }
    setFetchFlag("fetched");
  };

  const shouldRender = albums !== null && albums.length > 0;
  const { page, direction, sort } = queryParams;

  const mutateParams = (fields) => {
    fields.forEach((value) => {
      queryParams[value.field] = value.value;
    });
    setSearchParams(queryParams);
    setFetchFlag("get");
  };

  const { type } = queryParams;

  return (
    <Container>
      <Collapse in={filterToggle}>
        <div>
          <Row>
            <Col lg={3} className="mb-2">
              <Form.Label>Filter type</Form.Label>
              <div
                style={{
                  padding: "0.375rem 0.75rem",
                  border: "1px solid #ced4da",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <Form.Check
                    inline
                    label="Free text"
                    name="queryFilter"
                    type="radio"
                    checked={type === "text"}
                    onChange={(e) => {
                      mutateParams([
                        { field: "type", value: "text" },
                        { field: "page", value: 1 },
                      ]);
                    }}
                  />
                  <Form.Check
                    inline
                    label="Tags"
                    name="tagsFilter"
                    type="radio"
                    checked={type === "tags"}
                    onChange={(e) => {
                      delete queryParams.query;
                      queryRef.current.setAttribute("disabled", true);
                      mutateParams([
                        { field: "type", value: "tags" },
                        { field: "page", value: 1 },
                      ]);
                    }}
                  />
                </div>
              </div>
            </Col>
            <Col lg={3} className="mb-2">
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
                <InputGroup>
                  <Button
                    ref={queryRef}
                    disabled={query.length === 0 || getting}
                    type="submit"
                  >
                    Go
                  </Button>
                  <Form.Control
                    disabled={getting}
                    name="filter"
                    id="filter"
                    type="text"
                    placeholder={
                      type === "text"
                        ? "title, username, tags..."
                        : "nature, israel, photography..."
                    }
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

            <Col lg={3} className="mb-2">
              <Form.Label>Sort by</Form.Label>
              <Form.Select
                value={sort}
                disabled={getting}
                onChange={(e) => {
                  mutateParams([
                    { field: "sort", value: e.currentTarget.value },
                  ]);
                }}
              >
                {["created", "title", "userName"].map((field) => (
                  <option key={field} value={field}>
                    {field.toLocaleLowerCase()}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col lg={3} className="mb-2">
              <Form.Label>Direction</Form.Label>
              <Form.Select
                disabled={getting}
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
        </div>
      </Collapse>

      {loading &&
        [1, 3].map((value) => (
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
  );
};

export default Albums;
