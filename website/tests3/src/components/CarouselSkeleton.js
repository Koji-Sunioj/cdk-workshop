import Card from "react-bootstrap/Card";
import Carousel from "react-bootstrap/Carousel";

import { filler, carouselImg } from "../utils/styles";

const CarouselSkeleton = () => (
  <>
    <h2 style={filler}>&nbsp;</h2>
    <Carousel
      style={{ backgroundColor: "black" }}
      interval={null}
      className="mb-3"
      indicators={false}
      controls={false}
    >
      <Carousel.Item>
        <img
          src={"https://via.placeholder.com/400x400.png?text=Loading"}
          style={carouselImg}
          className="carousel-img"
        />
        <Carousel.Caption>
          <p style={filler}>&nbsp;</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
    <Card.Subtitle className="mb-2 text-muted" style={filler}>
      &nbsp;
    </Card.Subtitle>
    <Card.Text style={filler}>&nbsp;</Card.Text>
  </>
);

export default CarouselSkeleton;
