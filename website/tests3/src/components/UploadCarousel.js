import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/esm/Button";
import Carousel from "react-bootstrap/Carousel";
import CloseButton from "react-bootstrap/esm/CloseButton";

import { carouselEditPanel, carouselImg, buttonRow } from "../utils/styles";

const UploadCarousel = ({
  setIndex,
  previews,
  deletePicture,
  editMode,
  mutateCopy,
  reOrder,
  index,
}) => {
  return (
    <Carousel
      className="mb-3"
      style={{ backgroundColor: "black" }}
      activeIndex={index}
      interval={null}
      onSelect={(i) => {
        setIndex(i);
      }}
    >
      {previews.map((file, n) => {
        const { order, blob, text, name, closed } = file;

        return (
          <Carousel.Item key={order}>
            {editMode && (
              <CloseButton
                variant="white"
                style={{
                  position: "absolute",
                  right: "0",
                  color: "red",
                }}
                size="lg"
                onClick={() => {
                  deletePicture(file);
                }}
              />
            )}
            <img src={blob} style={carouselImg} className="carousel-img" />
            {!editMode && text !== null && (
              <Carousel.Caption>
                <h3>{file.text}</h3>
              </Carousel.Caption>
            )}
            {editMode && (
              <Carousel.Caption>
                <div style={carouselEditPanel}>
                  <p className="carousel-p" title={name}>
                    File: {name}
                  </p>
                  <p>
                    Photo: {order} / {previews.length}
                  </p>
                  <Form.Group className="mb-3">
                    <Form.Check
                      checked={!closed}
                      label="add text"
                      onChange={(e) => {
                        const { checked } = e.currentTarget;
                        mutateCopy(!checked, file, "closed");
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="A fancy title"
                      name="title"
                      value={text === null ? "" : text}
                      disabled={closed}
                      onChange={(e) => {
                        const { value } = e.currentTarget;
                        mutateCopy(value, file, "text");
                      }}
                    />
                  </Form.Group>
                  <div style={buttonRow}>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={file.order === 1}
                      onClick={() => {
                        reOrder(order, "front");
                      }}
                    >
                      Push forward
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={file.order === previews.length}
                      onClick={() => {
                        reOrder(order, "back");
                      }}
                    >
                      Push backward
                    </Button>
                  </div>
                </div>
              </Carousel.Caption>
            )}
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
};

export default UploadCarousel;
