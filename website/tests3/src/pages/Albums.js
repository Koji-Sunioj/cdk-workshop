import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/esm/Stack";
import Container from "react-bootstrap/Container";

import { useState } from "react";
import moment from "moment";

import { getAlbums } from "../utils/albumApi";

const Albums = () => {
  const [albums, setAlbums] = useState(null);
  albums === null &&
    (async () => {
      const { albums } = await getAlbums();

      setAlbums(albums);
    })();

  const shouldRender = albums !== null && albums.length > 0;
  console.log("rendered");

  return (
    <>
      <Container>
        {shouldRender &&
          albums.map((album) => {
            const photos = album.photos.sort((a, b) =>
              a.order > b.order ? 1 : b.order > a.order ? -1 : 0
            );
            const { albumId, title, tags, userName } = album;
            const created = moment(album.created).format("MMMM Do YYYY, H:mm");

            return (
              <Card className="mb-3" key={albumId}>
                <Card.Img variant="top" src={photos[0].url} />
                <Card.Body>
                  <Card.Title>{title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {created}
                  </Card.Subtitle>
                  <Card.Text>{userName}</Card.Text>
                  <Stack direction="horizontal" gap={3} className="mt-3">
                    {tags.map((tag) => (
                      <Button variant="info" key={tag}>
                        {tag}
                      </Button>
                    ))}
                  </Stack>
                </Card.Body>
              </Card>
            );
          })}
      </Container>
    </>
  );
};

export default Albums;

/*<div style={{ border: "1px solid black" }}>
                <Carousel
                  style={{ backgroundColor: "black" }}
                  interval={null}
                  controls={!shouldControl}
                  indicators={!shouldControl}
                >
                  {photos.map((photo) => (
                    <Carousel.Item>
                      <img
                        src={photo.url}
                        style={carouselImg}
                        className="carousel-img"
                      />
                      <Carousel.Caption>
                        <p>{photo.text}</p>
                      </Carousel.Caption>
                    </Carousel.Item>
                  ))}
                </Carousel>
                <h3>
                  <strong
                    onClick={() => {
                      const copy = [...albums];
                      const index = copy.findIndex(
                        (item) => item.albumId === album.albumId
                      );
                      copy[index]["expand"] = !copy[index]["expand"];
                      setAlbums(copy);
                    }}
                  >
                    {album.userName}
                  </strong>
                  {album.title}
                </h3>

                <Collapse in={album.expand}>
                  <div id="example-collapse-text">
                    <p>
                      {hours} {agoText} ago
                    </p>
                  </div>
                </Collapse>
              </div>*/
