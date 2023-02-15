import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/esm/Button";

import { Link } from "react-router-dom";

import moment from "moment";

const AlbumList = ({ albums, mutateParams, query }) => {
  return (
    <>
      {[0, 3].map((value) => (
        <Row key={value}>
          {albums.slice(value, value + 3).map((album) => {
            const photos = album.photos.sort((a, b) =>
              a.order > b.order ? 1 : b.order > a.order ? -1 : 0
            );
            const { albumId, title, tags, userName } = album;
            const created = moment(album.created).format("MMMM Do YYYY, H:mm");

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
                          const queryString =
                            query.length > 0 ? `${query},${tag}` : tag;
                          mutateParams([
                            { field: "query", value: queryString },
                            { field: "type", value: "tags" },
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
    </>
  );
};

export default AlbumList;
