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
      style={{ backgroundColor: "black" }}
      activeIndex={index}
      interval={null}
      onSelect={(i) => {
        setIndex(i);
      }}
    >
      {previews.map((file, n) => (
        <Carousel.Item key={file.order}>
          {file.completed ? (
            <div
              style={{
                color: "green",
                position: "absolute",
                right: "0",
              }}
            >
              &#x2705;
            </div>
          ) : (
            editMode && (
              <CloseButton
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
            )
          )}
          <img src={file.blob} style={carouselImg} className="carousel-img" />
          {!editMode && file.text !== null && (
            <Carousel.Caption>
              <h3>{file.text}</h3>
            </Carousel.Caption>
          )}
          {editMode && (
            <Carousel.Caption>
              <div style={carouselEditPanel}>
                <p className="carousel-p" title={file.name}>
                  File: {file.name}
                </p>
                <p>
                  Photo: {file.order} / {previews.length}
                </p>
                <Form.Group className="mb-3">
                  <Form.Check
                    checked={!file.closed}
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
                    value={file.text === null ? "" : file.text}
                    disabled={file.closed}
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
                      reOrder(file.order, "front");
                    }}
                  >
                    Push forward
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={file.order === previews.length}
                    onClick={() => {
                      reOrder(file.order, "back");
                    }}
                  >
                    Push backward
                  </Button>
                </div>
              </div>
            </Carousel.Caption>
          )}
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default UploadCarousel;
