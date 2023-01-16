import Collapse from "react-bootstrap/Collapse";
import Carousel from "react-bootstrap/Carousel";
import Container from "react-bootstrap/Container";

import { useState } from "react";

import { getAlbums } from "../utils/albumApi";
import { carouselImg } from "../utils/styles";

const Albums = () => {
  const [albums, setAlbums] = useState(null);

  albums === null &&
    (async () => {
      const { albums } = await getAlbums();
      albums.forEach((album) => {
        album.expand = false;
      });
      setAlbums(albums);
    })();

  const shouldRender = albums !== null && albums.length > 0;

  console.log(albums);

  return (
    <>
      <Container>
        {shouldRender &&
          albums.map((album) => {
            const photos = album.photos.sort((a, b) =>
              a.order > b.order ? 1 : b.order > a.order ? -1 : 0
            );
            const currentZone = new Date(album.created).toDateString();
            const shouldControl = photos.length === 1;

            return (
              <div style={{ border: "1px solid black" }}>
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
                      console.log(copy[index]);
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
                    <p> {currentZone}</p>
                  </div>
                </Collapse>
              </div>
            );
          })}
      </Container>
    </>
  );
};

export default Albums;
