import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";

import NotFound from "./NotFound";
import AlbumEdit from "../components/AlbumEdit";
import AlbumSubmit from "../components/AlbumSubmit";
import AlbumUpload from "../components/AlbumUpload";
import UploadCarousel from "../components/UploadCarousel";
import { getSignedUrl, newAlbum } from "../utils/albumApi";

import uuid from "react-uuid";

import { globalContext } from "../App";
import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CreateAlbum = () => {
  // const formRef = useRef();
  // const navigate = useNavigate();
  // // const { albumId } = useParams();
  // // const { state } = useLocation();
  // const [index, setIndex] = useState(0);
  // const [login] = useContext(globalContext);
  // const [tags, setTags] = useState([]);
  // const [editMode, setEditMode] = useState(false);
  // const [title, setTitle] = useState("");
  // // const [patchState, setPatchState] = useState("idle");
  // const [editStep, setEditStep] = useState("upload");
  // // const [mutateS3, setMutateS3] = useState([]);
  // const [previews, setPreviews] = useState(null);

  const formRef = useRef();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [login] = useContext(globalContext);
  const [tags, setTags] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [uploadStep, setUploadStep] = useState("upload");
  const [previews, setPreviews] = useState([]);
  const [postState, setPostState] = useState("idle");

  const createAlbum = async (event) => {
    const {
      title: { value: title },
    } = event.currentTarget;
    event.preventDefault();
    setPostState("posting");

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
        return response.ok;
      })
    );
    if (responses.every((response) => response)) {
      dynamoAlbum = {
        photos: dynamoData,
        albumId: albumId,
        title: title,
        userName: userName,
        tags: tags,
      };
      const statusCode = await newAlbum({
        token: AccessToken,
        album: dynamoAlbum,
      });
      switch (statusCode) {
        case 200:
          setPostState("posted");
          setTimeout(() => {
            navigate("/albums");
          }, 1500);
          break;
        default:
          setPostState("error");
      }
    }
  };

  const previewMapping = (event) => {
    const {
      target: { files },
    } = event;
    if (files.length > 10) {
      event.preventDefault();
      event.target.value = null;
    } else {
      const temp = Array.from(files).map((file, i) => {
        const preview = {
          name: file.name,
          type: file.type,
          file: file,
          blob: URL.createObjectURL(file),
          closed: true,
          text: null,
          order: i + 1,
        };
        return preview;
      });
      setPreviews(temp);
      setUploadStep("edit");
    }
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

  const startOver = () => {
    setPreviews([]);
    setUploadStep("upload");
    setEditMode(false);
  };

  previews.sort((a, b) => (a.order > b.order ? 1 : b.order > a.order ? -1 : 0));
  const editAble = previews.length > 0 && uploadStep === "edit";
  const submitAble = previews.length > 0 && uploadStep === "submit";

  return (
    <>
      {login === null ? (
        <NotFound />
      ) : (
        <Container>
          <Row>
            <Col lg="5">
              <Form
                onSubmit={createAlbum}
                encType="multipart/form-data"
                ref={formRef}
              >
                <fieldset
                  disabled={postState === "posting" || postState === "posted"}
                >
                  {uploadStep === "upload" && (
                    <AlbumUpload previewMapping={previewMapping} />
                  )}
                  {editAble && (
                    <AlbumEdit
                      startOver={startOver}
                      setEditMode={setEditMode}
                      setUploadStep={setUploadStep}
                    />
                  )}
                  {submitAble && (
                    <AlbumSubmit
                      formRef={formRef}
                      setUploadStep={setUploadStep}
                      tags={tags}
                      setTags={setTags}
                      postState={postState}
                      setTitle={setTitle}
                      title={title}
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
