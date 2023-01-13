import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/esm/Button";

import { getSignedUrl } from "../utils/albumApi";

import { useState } from "react";

const CreateAlbum = () => {
  const [previews, setPreviews] = useState([]);

  const test = async (event) => {
    event.preventDefault();

    const url = await getSignedUrl();

    const file = event.target.upload.files[0];

    await fetch(url, {
      method: "PUT",
      body: file,
    });
  };

  // const showPreviews = (event) => {
  //   setPreviews(event.currentTarget.files);
  // };

  return (
    <Container>
      <Row>
        <Col lg="5">
          <h2>Create album</h2>
          <Form onSubmit={test} encType="multipart/form-data">
            <Form.Group className="mb-3">
              <Form.Label>Multiple files input example</Form.Label>
              <Form.Control type="file" name="upload" accept="image/*" />
            </Form.Group>

            <Button type="submit" variant="primary">
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateAlbum;

/* <Container>
      <Row>
        <Col lg="5">
          <h2>Create album</h2>
          <Form onSubmit={test} encType="multipart/form-data">
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="A fancy title"
                name="title"
                autoComplete="on"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Multiple files input example</Form.Label>
              <Form.Control
                type="file"
                multiple
                name="files"
                accept="image/*"
                onChange={showPreviews}
              />
            </Form.Group>
            {previews.length > 0 && (
              <Button type="submit" variant="primary">
                Submit
              </Button>
            )}
          </Form>
        </Col>
      </Row>
      {Array.from(previews).map((file) => (
        <Row className="mt-5">
          <Col lg="5">
            <Card>
              <Card.Img
                variant="top"
                src={URL.createObjectURL(file)}
                className="p-3"
              />
              <Card.Body>
                <Form.Control
                  type="text"
                  placeholder="A fancy title"
                  name="title"
                  autoComplete="on"
                  value={file.name}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ))}
    </Container>*/
