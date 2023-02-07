import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Pagination from "react-bootstrap/Pagination";
import ToggleButton from "react-bootstrap/ToggleButton";

import moment from "moment";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

import { getAlbums } from "../utils/albumApi";
import CardSkeleton from "../components/CardSkeleton";

const Albums = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [albums, setAlbums] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [page, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [direction, setDirection] = useState(
    searchParams.get("direction") || "descending"
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "created");

  useEffect(() => {
    if (
      albums === null ||
      page !== Number(searchParams.get("page")) ||
      direction !== searchParams.get("direction") ||
      sort !== searchParams.get("sort")
    ) {
      setSearchParams({ page: page, direction: direction, sort: sort });
      setLoading(true);
      fetchAlbums();
    } else {
      setLoading(false);
    }
  }, [albums, page, direction, sort]);

  const fetchAlbums = async () => {
    const { albums, pages: fetchedPages } = await getAlbums({
      page: page,
      direction: direction,
      sort: sort,
    });
    const realPages = new Array(Number(fetchedPages))
      .fill(null)
      .map((v, n) => n + 1);
    setAlbums(albums);

    if (realPages.length !== pages.length) {
      setPages(realPages);
    }
  };

  const shouldRender = albums !== null && albums.length > 0;

  return (
    <>
      <Container>
        <Row className="mb-3">
          <Col>
            <Form.Label>Sort by</Form.Label>
            <Form.Select
              onChange={(e) => {
                setSort(e.currentTarget.value);
              }}
            >
              {["created", "title", "userName"].map((field) => (
                <option key={field} value={field} selected={sort === field}>
                  {field.toLocaleLowerCase()}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col>
            <Form.Label>Direction</Form.Label>
            <Form.Select
              onChange={(e) => {
                setDirection(e.currentTarget.value);
              }}
            >
              {["descending", "ascending"].map((field) => (
                <option
                  key={field}
                  value={field}
                  selected={direction === field}
                >
                  {field.toLocaleLowerCase()}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {loading && <CardSkeleton />}
        {shouldRender &&
          albums.map((album) => {
            const photos = album.photos.sort((a, b) =>
              a.order > b.order ? 1 : b.order > a.order ? -1 : 0
            );
            const { albumId, title, tags, userName } = album;
            const created = moment(album.created).format("MMMM Do YYYY, H:mm");

            return (
              <Card className="mb-3" key={albumId} lg={5}>
                <Card.Img variant="top" src={photos[0].url} />
                <Card.Body>
                  <Link to={`${albumId}`}>
                    <Card.Title>{title}</Card.Title>
                  </Link>
                  <Card.Subtitle className="mb-2 text-muted">
                    {created}
                  </Card.Subtitle>
                  <Card.Text>
                    {photos.length} {photos.length === 1 ? "photo " : "photos "}
                    by {userName}
                  </Card.Text>
                  {tags.map((tag) => (
                    <Button variant="info" key={tag} style={{ margin: "3px" }}>
                      {tag}
                    </Button>
                  ))}
                </Card.Body>
              </Card>
            );
          })}
        <Pagination>
          {pages.length > 0 &&
            pages.map((number) => (
              <Pagination.Item
                key={number}
                active={number === page}
                onClick={() => {
                  setCurrentPage(number);
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
