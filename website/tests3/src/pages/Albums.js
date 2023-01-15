import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { globalContext } from "../App";

import { getAlbums } from "../utils/albumApi";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";

const Albums = () => {
  const [login] = useContext(globalContext);
  const [albums, setAlbums] = useState(null);

  albums === null &&
    (async () => {
      const { albums } = await getAlbums();
      setAlbums(albums);
    })();

  const shouldRender = albums !== null && albums.length > 0;

  console.log(albums);

  return (
    <>
      <Container>
        <Row>
          <Col>
            <h2>Browse Photo Albums</h2>
            {login !== null && (
              <Link to={"/create-album"}>Create a new photo album</Link>
            )}
          </Col>
        </Row>
        {shouldRender &&
          albums.map((album) => {
            const cover = album.photos.find((photo) => photo.order === 1);
            const currentZone = new Date(album.created).toDateString();
            console.log(currentZone);

            return (
              <Row style={{ width: "18rem" }} key={album.albumId}>
                <Col>
                  <p> {currentZone}</p>
                  <p>{album.userName}</p>
                  <img src={cover.url} />
                  {cover.text !== null && <p>{cover.text}</p>}
                </Col>
              </Row>
            );
          })}
      </Container>
    </>
  );
};

export default Albums;
