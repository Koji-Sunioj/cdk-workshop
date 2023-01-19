import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/esm/Container";

import { globalContext } from "../App";
import {
  getAlbum,
  patchAlbum,
  getSignedUrl,
  deleteObject,
} from "../utils/albumApi";
import AlbumEdit from "../components/AlbumEdit";
import AlbumSubmit from "../components/AlbumSubmit";
import AlbumUpload from "../components/AlbumUpload";
import UploadCarousel from "../components/UploadCarousel";

import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const EditAlbum = () => {
  const formRef = useRef();
  const navigate = useNavigate();
  const { albumId } = useParams();
  const { state } = useLocation();
  const [index, setIndex] = useState(0);
  const [login] = useContext(globalContext);
  const [tags, setTags] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [patchState, setPatchState] = useState("idle");
  const [editStep, setEditStep] = useState("upload");
  const [mutateS3, setMutateS3] = useState([]);
  const [previews, setPreviews] = useState(null);

  useEffect(() => {
    if (state !== null && state.hasOwnProperty("album")) {
      createMapFromFetch(state.album);
    } else {
      fetchAlbum();
    }
  }, [state]);

  const fetchAlbum = async () => {
    const { album } = await getAlbum(albumId);
    createMapFromFetch(album);
  };

  const updateAlbum = async (event) => {
    event.preventDefault();
    setPatchState("patching");
    const { AccessToken } = login;

    let deleteResponses = [];
    let putResponses = [];

    //1. if any objects exist in the deletion array, remove from s3
    if (mutateS3.length > 0) {
      const keys = mutateS3.map((item) => item.name);
      deleteResponses = await Promise.all(
        keys.map(async (key) => {
          const statusCode = await deleteObject({
            s3Object: key,
            token: AccessToken,
            albumId: albumId,
          });
          return statusCode === 200;
        })
      );
    }

    //2. put any objects in previews which don't already exist in s3
    const toBePut = previews.filter((item) => item.type !== "s3Object");
    const dynamoData = [];
    if (deleteResponses.every((response) => response) && toBePut.length > 0) {
      putResponses = await Promise.all(
        toBePut.map(async (item) => {
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
    }

    //.3 if all put tasks successful, concat the values with the preview values
    // which exist in s3 and dynamo db, update db
    if (putResponses.every((response) => response)) {
      const s3Existing = previews.filter((item) => item.type === "s3Object");
      const readForPatch = s3Existing.map((item) => {
        const photo = { url: item.blob, text: item.text, order: item.order };
        return photo;
      });

      const merged = readForPatch.concat(dynamoData);
      const sendObject = {
        album: {
          title: title,
          albumId: albumId,
          photos: merged,
          tags: tags,
        },
        token: AccessToken,
        albumId: albumId,
      };
      const statusCode = await patchAlbum(sendObject);
      switch (statusCode) {
        case 200:
          setPatchState("patched");
          setTimeout(() => {
            navigate(`/albums/${albumId}`);
          }, 1500);
          break;
        default:
          alert("error");
      }
    }
  };

  const createMapFromFetch = (album) => {
    const { albumId, tags, title } = album;
    const fetchedPreviews = album.photos.map((item) => {
      const temp = {
        name: item.url.split(`${albumId}/`)[1],
        type: "s3Object",
        file: null,
        blob: item.url,
        closed: item.text === null,
        text: item.text,
        order: item.order,
      };
      return temp;
    });
    setTags(tags);
    setTitle(title);
    setPreviews(fetchedPreviews);
  };

  const previewMapping = (event) => {
    const fetchedPreviewsLength = previews.length;
    const {
      target: { files },
    } = event;
    if (files.length + fetchedPreviewsLength > 10) {
      event.preventDefault();
      event.target.value = null;
    } else {
      const existing = previews.map((preview) => preview.name);
      const filtered = [];

      Array.from(files).forEach((file, i) => {
        if (!existing.includes(file.name)) {
          const preview = {
            name: file.name,
            type: file.type,
            file: file,
            blob: URL.createObjectURL(file),
            closed: true,
            text: null,
            order: fetchedPreviewsLength + filtered.length + 1,
          };
          filtered.push(preview);
        }
      });
      if (filtered.length > 0) {
        const merged = previews.concat(filtered);
        setPreviews(merged);
        setEditStep("edit");
      }
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
    const { type, name } = file;
    if (type === "s3Object") {
      const s3delete = [...mutateS3];
      s3delete.push(file);
      setMutateS3(s3delete);
    }
    const copy = [...previews];
    const filtered = copy.filter((item) => item.name !== name);
    if (filtered.length === 0) {
      startOver();
    } else {
      filtered.forEach((item, n) => (item.order = n + 1));
      setPreviews(filtered);
      setIndex(0);
    }
  };

  const startOver = () => {
    fetchAlbum();
    setMutateS3([]);
    setEditMode(false);
    setEditStep("upload");
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

  const shouldError =
    (previews !== null && previews.length === 0) || login === null;
  const shouldRender =
    previews !== null && previews.length > 0 && login !== null;

  const editAble = shouldRender && editStep === "edit";
  const submitAble = shouldRender && editStep === "submit";

  return (
    <Container>
      {shouldRender && (
        <Row>
          <Col lg="5">
            <Form
              encType="multipart/form-data"
              ref={formRef}
              onSubmit={updateAlbum}
            >
              <fieldset
                disabled={patchState === "patching" || patchState === "patched"}
              >
                {editStep === "upload" && (
                  <AlbumUpload
                    previewMapping={previewMapping}
                    task="edit"
                    setStep={setEditStep}
                  />
                )}
                {editAble && (
                  <AlbumEdit
                    setEditMode={setEditMode}
                    setUploadStep={setEditStep}
                    startOver={startOver}
                  />
                )}
                {submitAble && (
                  <AlbumSubmit
                    formRef={formRef}
                    setUploadStep={setEditStep}
                    tags={tags}
                    setTags={setTags}
                    postState={patchState}
                    title={title}
                    setTitle={setTitle}
                  />
                )}
              </fieldset>
            </Form>
          </Col>
        </Row>
      )}
      {shouldError && (
        <Row>
          <Col lg="5">
            <Alert variant="danger" lg>
              No album with this Id exists
            </Alert>
          </Col>
        </Row>
      )}
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
  );
};

export default EditAlbum;
