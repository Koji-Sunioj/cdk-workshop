import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Carousel from "react-bootstrap/Carousel";
import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/Container";
import InputGroup from "react-bootstrap/InputGroup";
import CloseButton from "react-bootstrap/CloseButton";

import NotFound from "./NotFound";
import { getSignedUrl } from "../utils/albumApi";

import { globalContext } from "../App";
import { useState, useContext } from "react";

const CreateAlbum = () => {
  const [index, setIndex] = useState(0);
  const [login] = useContext(globalContext);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const createAlbum = async (event) => {
    setLoading(true);
    event.preventDefault();
    const { AccessToken } = login;
    let dynamoAlbum;
    const dynamoData = [];
    const responses = await Promise.all(
      previews.map(async (item) => {
        const { name, type, file, text, order } = item;
        const { url } = await getSignedUrl({
          name: name,
          type: type,
          token: AccessToken,
        });
        const response = await fetch(url, {
          method: "PUT",
          body: file,
        });
        dynamoData.push({
          url: response.url.split("?")[0],
          text: text,
          order: order,
        });
        mutateCopy(response.ok, file, "completed");
        return response.ok;
      })
    );
    if (responses.every((response) => response)) {
      dynamoAlbum = {
        photos: dynamoData,
      };
    }
    setLoading(false);
    console.log(dynamoAlbum);
  };

  const previewMapping = (files) => {
    const temp = [];
    Array.from(files).forEach((file, i) => {
      temp.push({
        completed: false,
        name: file.name,
        type: file.type,
        file: file,
        blob: URL.createObjectURL(file),
        closed: true,
        text: null,
        order: i + 1,
      });
    });
    return temp;
  };

  const albumAble = previews.length > 0 && login !== null;

  const mutateCopy = (newValue, file, attribute) => {
    const copy = [...previews];
    const index = copy.findIndex((item) => item.name === file.name);
    copy[index][attribute] = newValue;
    if (attribute === "closed" && typeof newValue == "boolean") {
      copy[index].text = null;
    }
    setPreviews(copy);
  };

  const reOrder = (order) => {
    const found = previews.find((item) => item.order === order);
    const filtered = previews.filter((item) => item.order !== order);
    filtered.splice(0, 0, found);
    filtered.forEach((item, n) => (item.order = n + 1));
    setPreviews(filtered);
    setIndex(0);
  };

  previews.sort((a, b) => (a.order > b.order ? 1 : b.order > a.order ? -1 : 0));

  return (
    <>
      {login === null ? (
        <NotFound />
      ) : (
        <Container>
          <Row>
            <Col lg="5">
              <h2>Create album</h2>
              <Form onSubmit={createAlbum} encType="multipart/form-data">
                <fieldset disabled={loading}>
                  <Form.Group className="mb-3">
                    <Form.Label>Upload your files (max 10)</Form.Label>
                    <Form.Control
                      id="fileInput"
                      type="file"
                      name="upload"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files.length > 10) {
                          e.preventDefault();
                          e.target.value = null;
                        } else {
                          const previewArray = previewMapping(e.target.files);
                          setPreviews(previewArray);
                        }
                      }}
                    />
                  </Form.Group>
                  {albumAble && (
                    <Button type="submit" variant="primary">
                      Submit
                    </Button>
                  )}
                </fieldset>
              </Form>
            </Col>
          </Row>

          {albumAble && (
            <Carousel
              slide={false}
              variant="dark"
              style={{ backgroundColor: "lightgrey" }}
              activeIndex={index}
              interval={null}
              onSelect={(i) => {
                setIndex(i);
              }}
            >
              {previews.map((file, n) => (
                <Carousel.Item key={file.order}>
                  {file.completed ? (
                    <div style={{ color: "green" }}>&#x2705;</div>
                  ) : (
                    <CloseButton
                      size="lg"
                      onClick={() => {
                        const copy = [...previews];
                        const filtered = copy.filter(
                          (item) => item.name !== file.name
                        );
                        filtered.forEach((item, n) => (item.order = n + 1));
                        setPreviews(filtered);
                        const dt = new DataTransfer();
                        Array.from(previews).forEach((item) => {
                          if (item.name !== file.name) {
                            dt.items.add(item.file);
                          }
                        });
                        setIndex(0);
                        const input = document.getElementById("fileInput");
                        input.files = dt.files;
                      }}
                    />
                  )}
                  <img
                    src={file.blob}
                    style={{
                      width: "auto",
                      height: "50vw",
                      marginLeft: "auto",
                      marginRight: "auto",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {file.order}
                  <Carousel.Caption>
                    <InputGroup className="mb-3" size="lg">
                      <Button
                        style={{
                          backgroundColor: "#e9ecef",
                          color: "black",
                          border: "1px solid #ced4da",
                        }}
                        disabled={file.order === 1}
                        onClick={() => {
                          reOrder(file.order);
                        }}
                      >
                        {file.order === 1 ? "cover" : "push front"}
                      </Button>
                      <InputGroup.Checkbox
                        onChange={(e) => {
                          const { checked } = e.currentTarget;
                          mutateCopy(!checked, file, "closed");
                        }}
                      />
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
                    </InputGroup>
                  </Carousel.Caption>
                </Carousel.Item>
              ))}
            </Carousel>
          )}
        </Container>
      )}
    </>
  );
};

export default CreateAlbum;
