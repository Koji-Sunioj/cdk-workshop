import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/Container";
import InputGroup from "react-bootstrap/InputGroup";
import CloseButton from "react-bootstrap/CloseButton";

import { getSignedUrl } from "../utils/albumApi";
import NotFound from "./NotFound";

import { globalContext } from "../App";
import { useState, useContext } from "react";

const CreateAlbum = () => {
  const [login] = useContext(globalContext);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const test = async (event) => {
    setLoading(true);
    event.preventDefault();
    const { AccessToken } = login;

    const {
      title: { value: title },
    } = event.currentTarget;

    const dynamoData = [];
    const responses = await Promise.all(
      previews.map(async (item) => {
        const { name, type, file, text } = item;
        const { url } = await getSignedUrl({
          name: name,
          type: type,
          token: AccessToken,
        });
        const response = await fetch(url, {
          method: "PUT",
          body: file,
        });
        dynamoData.push({ url: response.url.split("?")[0], text: text });
        mutateCopy(response.ok, file, "completed");
        return response.ok;
      })
    );
    if (responses.every((response) => response)) {
      const dynamoAlbum = {
        title: title,
        photos: dynamoData,
      };
    }
    setLoading(false);
  };

  const previewMapping = (files) => {
    const temp = [];
    Array.from(files).forEach((file) => {
      temp.push({
        completed: false,
        name: file.name,
        type: file.type,
        file: file,
        blob: URL.createObjectURL(file),
        closed: true,
        text: null,
      });
    });
    return temp;
  };

  const albumAble = previews.length > 0 && login !== null;

  const mutateCopy = (newValue, file, attribute) => {
    console.log(previews);
    const copy = [...previews];
    const index = copy.findIndex((item) => item.name === file.name);
    copy[index][attribute] = newValue;
    if (attribute === "closed" && typeof newValue == "boolean") {
      copy[index].text = null;
    }
    setPreviews(copy);
  };

  return (
    <>
      {login === null ? (
        <NotFound />
      ) : (
        <Container>
          <Row>
            <Col lg="5">
              <h2>Create album</h2>
              <Form onSubmit={test} encType="multipart/form-data">
                <fieldset disabled={loading}>
                  {albumAble && (
                    <Form.Group className="mb-3">
                      <Form.Label>Multiple files input example</Form.Label>
                      <Form.Control type="text" name="title" />
                    </Form.Group>
                  )}
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
          {Array.from(previews).map((file) => (
            <Row className="mt-5" key={file.name}>
              <Col lg="5">
                <Card>
                  <fieldset disabled={loading}>
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
                          setPreviews(filtered);
                          const dt = new DataTransfer();
                          Array.from(previews).forEach((item) => {
                            if (item.name !== file.name) {
                              dt.items.add(item.file);
                            }
                          });
                          const input = document.getElementById("fileInput");
                          input.files = dt.files;
                        }}
                      />
                    )}
                    <Card.Img variant="top" src={file.blob} className="p-3" />
                    <Card.Body>
                      <InputGroup className="mb-3">
                        <InputGroup.Checkbox
                          aria-label="Checkbox for following text input"
                          onChange={(e) => {
                            const { checked } = e.currentTarget;
                            mutateCopy(!checked, file, "closed");
                          }}
                        />
                        <Form.Control
                          type="text"
                          placeholder="A fancy title"
                          name="title"
                          autoComplete="on"
                          value={file.text === null ? "" : file.text}
                          disabled={file.closed}
                          onChange={(e) => {
                            const { value } = e.currentTarget;
                            mutateCopy(value, file, "text");
                          }}
                        />
                      </InputGroup>
                    </Card.Body>
                  </fieldset>
                  <Card.Footer>
                    <small className="text-muted">{file.name}</small>
                  </Card.Footer>
                </Card>
              </Col>
            </Row>
          ))}
        </Container>
      )}
    </>
  );
};

export default CreateAlbum;
