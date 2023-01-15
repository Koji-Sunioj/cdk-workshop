import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";

import AlbumUpload from "../components/AlbumUpload";
import AlbumEdit from "../components/AlbumEdit";
import UploadCarousel from "../components/UploadCarousel";
import NotFound from "./NotFound";

import { getSignedUrl, newAlbum } from "../utils/albumApi";

import uuid from "react-uuid";
import { useNavigate } from "react-router-dom";
import { globalContext } from "../App";
import { useState, useContext } from "react";

const CreateAlbum = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [uploadStep, setUploadStep] = useState("upload");
  const [editMode, setEditMode] = useState(false);
  const [login] = useContext(globalContext);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const createAlbum = async (event) => {
    event.preventDefault();
    setLoading(true);

    const albumId = uuid();
    const { AccessToken, userName } = login;
    let dynamoAlbum;

    const dynamoData = [];

    const responses = await Promise.all(
      previews.map(async (item) => {
        const { name, type, file, text, order } = item;
        const newPath = `${albumId}/${name}`;
        const { url } = await getSignedUrl({
          name: newPath,
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
        albumId: albumId,
        userName: userName,
      };
      const statusCode = await newAlbum({
        token: AccessToken,
        album: dynamoAlbum,
      });
      switch (statusCode) {
        case 200:
          alert("successfully created album");
          navigate("/albums");
          break;
        default:
          alert("there was an error");
      }
    }

    setLoading(false);
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
    setPreviews(temp);
  };

  const mutateCopy = (newValue, file, attribute) => {
    const copy = [...previews];
    const index = copy.findIndex((item) => item.name === file.name);
    copy[index][attribute] = newValue;
    if (attribute === "closed" && typeof newValue == "boolean") {
      copy[index].text = null;
    }
    setPreviews(copy);
  };

  const deletePicture = (file) => {
    const copy = [...previews];
    const filtered = copy.filter((item) => item.name !== file.name);
    if (filtered.length === 0) {
      setUploadStep("upload");
      setEditMode(false);
    } else {
      filtered.forEach((item, n) => (item.order = n + 1));
      setPreviews(filtered);
      setIndex(0);
    }
  };

  const reOrder = (order, position) => {
    const found = previews.find((item) => item.order === order);
    const filtered = previews.filter((item) => item.order !== order);
    const trueIndex = found.order - 1;
    let sideStep = position === "front" ? trueIndex - 1 : trueIndex + 1;

    position === "front"
      ? filtered.splice(sideStep, 0, found)
      : filtered.splice(sideStep, 0, found);

    filtered.forEach((item, n) => (item.order = n + 1));
    setIndex(sideStep);
    setPreviews(filtered);
  };

  previews.sort((a, b) => (a.order > b.order ? 1 : b.order > a.order ? -1 : 0));
  const editAble = previews.length > 0 && uploadStep === "edit";

  return (
    <>
      {login === null ? (
        <NotFound />
      ) : (
        <Container>
          <Row>
            <Col lg="5">
              <Form onSubmit={createAlbum} encType="multipart/form-data">
                <fieldset disabled={loading}>
                  {uploadStep === "upload" && (
                    <AlbumUpload
                      previewMapping={previewMapping}
                      setUploadStep={setUploadStep}
                    />
                  )}
                  {editAble && (
                    <AlbumEdit
                      setEditMode={setEditMode}
                      setUploadStep={setUploadStep}
                      setPreviews={setPreviews}
                    />
                  )}
                </fieldset>
              </Form>
            </Col>
          </Row>
          {editAble && (
            <UploadCarousel
              setIndex={setIndex}
              previews={previews}
              deletePicture={deletePicture}
              editMode={editMode}
              mutateCopy={mutateCopy}
              reOrder={reOrder}
              index={index}
            />
          )}
        </Container>
      )}
    </>
  );
};

export default CreateAlbum;
