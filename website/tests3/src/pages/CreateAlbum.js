import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/esm/Button";

import { getSignedUrl } from "../utils/albumApi";

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
      target: {
        upload: { files: file },
      },
    } = event;

    console.log(file[0]);

    const { name, type } = file[0];
    const { url } = await getSignedUrl({
      name: name,
      type: type,
      token: AccessToken,
    });

    console.log(url);

    const something = await fetch(url, {
      method: "PUT",
      body: file,
    });
    console.log(something);
    setLoading(false);
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
            <fieldset disabled={loading}>
              <Form.Group className="mb-3">
                <Form.Label>Multiple files input example</Form.Label>
                <Form.Control type="file" name="upload" accept="image/*" />
              </Form.Group>
              <Button type="submit" variant="primary">
                Submit
              </Button>
            </fieldset>
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
