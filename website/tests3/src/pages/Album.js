import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Stack from "react-bootstrap/esm/Stack";
import Button from "react-bootstrap/esm/Button";
import Carousel from "react-bootstrap/Carousel";
import Container from "react-bootstrap/esm/Container";

import { globalContext } from "../App";
import { carouselImg } from "../utils/styles";
import { deleteAlbum, getAlbum } from "../utils/albumApi";
import CarouselSkeleton from "../components/CarouselSkeleton";

import moment from "moment";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";

const Album = () => {
  const navigate = useNavigate();
  const { albumId } = useParams();
  const [deleteState, setDeleteState] = useState("idle");
  const [album, setAlbum] = useState(null);
  const [login] = useContext(globalContext);
  const [loading, setLoading] = useState(false);

  let userName, AccessToken;
  if (login !== null) {
    ({ userName, AccessToken } = login);
  }

  useEffect(() => {
    if (album === null) {
      setLoading(true);
      fetchAlbum();
    } else {
      setLoading(false);
    }
  }, [album]);

  const fetchAlbum = async () => {
    const { album } = await getAlbum(albumId);
    setAlbum(album);
  };

  const removeAlbum = async () => {
    setDeleteState("deleting");
    const statusCode = await deleteAlbum({
      token: AccessToken,
      albumId: albumId,
    });

    switch (statusCode) {
      case 200:
        setDeleteState("deleted");
        setTimeout(() => {
          navigate("/albums");
        }, 1500);

        break;
      default:
        setDeleteState("error");
    }
  };

  const shouldRender = album !== null && album.hasOwnProperty("albumId");
  const shouldError = album !== null && !album.hasOwnProperty("albumId");

  shouldRender &&
    album.photos.sort((a, b) =>
      a.order > b.order ? 1 : b.order > a.order ? -1 : 0
    );

  return (
    <Container>
      {loading && <CarouselSkeleton />}
      {shouldRender && (
        <>
          <h2>{album.title}</h2>
          <Carousel
            indicators={album.photos.length > 1}
            controls={album.photos.length > 1}
            style={{ backgroundColor: "black" }}
            interval={null}
            className="mb-3"
          >
            {album.photos.map((photo) => {
              const { url, text, order } = photo;
              return (
                <Carousel.Item key={order}>
                  <img src={url} style={carouselImg} className="carousel-img" />
                  <Carousel.Caption>
                    <p>{text}</p>
                  </Carousel.Caption>
                </Carousel.Item>
              );
            })}
          </Carousel>
          <Card.Subtitle className="mb-2 text-muted">
            {moment(album.created).format("MMMM Do YYYY, H:mm")}
          </Card.Subtitle>
          <Card.Text>{album.userName}</Card.Text>
          <Stack direction="horizontal" gap={3} className="mb-3">
            {album.tags.map((tag) => (
              <Button
                variant="info"
                key={tag}
                as={Link}
                to={`/albums?query=${tag}`}
              >
                {tag}
              </Button>
            ))}
          </Stack>
          {userName === album.userName && (
            <>
              <h3>options</h3>
              <Stack direction="horizontal" gap={3} className="mb-3">
                <Button
                  variant="danger"
                  onClick={removeAlbum}
                  disabled={loading}
                >
                  Delete Album
                </Button>
                <Link
                  to={`/albums/edit/${album.albumId}`}
                  state={{ album: album }}
                >
                  <Button variant="primary">Edit Album</Button>
                </Link>
              </Stack>
              {deleteState === "deleting" && (
                <Alert variant="info">Deleting</Alert>
              )}
              {deleteState === "deleted" && (
                <Alert variant="success">Deleted</Alert>
              )}
            </>
          )}
        </>
      )}
      {shouldError && (
        <Row>
          <Col lg="5">
            <Alert variant="danger" lg>
              No album with this Id exists
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Album;
