import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";

import NotFound from "./NotFound";
import AlbumEdit from "../components/AlbumEdit";
import AlbumSubmit from "../components/AlbumSubmit";
import AlbumUpload from "../components/AlbumUpload";
import UploadCarousel from "../components/UploadCarousel";

import { globalContext } from "../App";
import { getAlbum, patchAlbum, newAlbum } from "../utils/albumApi";
import {
  fileMapper,
  existingFileMapper,
  deleteS3Mapper,
  putS3Mapper,
  responseMapper,
  previewMapper,
} from "../utils/mappers";

import uuid from "react-uuid";
import { useState, useContext, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const AlbumForm = ({ task }) => {
  const formRef = useRef();
  const navigate = useNavigate();
  let { albumId } = useParams();
  const { state } = useLocation();
  const [login] = useContext(globalContext);
  const [tags, setTags] = useState([]);
  const [index, setIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [patchState, setPatchState] = useState("idle");
  const [editStep, setEditStep] = useState("upload");
  const [mutateS3, setMutateS3] = useState([]);
  const [previews, setPreviews] = useState(null);

  useEffect(() => {
    task === "edit" &&
      (() => {
        if (state !== null && state.hasOwnProperty("album")) {
          createMapFromFetch(state.album);
        } else {
          console.log("festec");
          fetchAlbum();
        }
      })();
  }, [state]);

  const updateAlbum = async (event) => {
    event.preventDefault();
    setPatchState("patching");
    let putResponses = [];
    let deleteResponses = [];
    let finalPhotos, sendObject, statusCode;
    const { AccessToken, userName } = login;

    switch (task) {
      case "edit":
        //deleting objects from s3
        if (mutateS3.length > 0) {
          const keys = mutateS3.map((item) => item.name);
          deleteResponses = await Promise.all(
            keys.map(deleteS3Mapper({ token: AccessToken, albumId: albumId }))
          );
        }

        //putting new objects to s3
        const toBePut = previews.filter((item) => item.type !== "s3Object");
        const shouldPut =
          deleteResponses.every((response) => response) && toBePut.length > 0;
        if (shouldPut) {
          putResponses = await Promise.all(
            toBePut.map(putS3Mapper({ token: AccessToken, albumId: albumId }))
          );
        }

        //updating dynamodb
        if (putResponses.every((response) => response.success)) {
          const dynamoData = putResponses.map(responseMapper);
          const s3Existing = previews.filter(
            (item) => item.type === "s3Object"
          );
          const readForPatch = s3Existing.map(previewMapper);

          finalPhotos = readForPatch.concat(dynamoData);
          console.log(finalPhotos);
          sendObject = {
            token: AccessToken,
            albumId: albumId,
            album: {
              title: title,
              albumId: albumId,
              photos: finalPhotos,
              tags: tags,
              photoLength: finalPhotos.length,
            },
          };
          console.log(sendObject);

          statusCode = await patchAlbum(sendObject);
        }
        break;
      case "create":
        albumId = uuid();
        putResponses = await Promise.all(
          previews.map(putS3Mapper({ token: AccessToken, albumId: albumId }))
        );

        if (putResponses.every((response) => response.success)) {
          finalPhotos = putResponses.map(responseMapper);
          sendObject = {
            token: AccessToken,
            album: {
              photos: finalPhotos,
              albumId: albumId,
              title: title,
              userName: userName,
              tags: tags,
              photoLength: finalPhotos.length,
            },
          };
          statusCode = await newAlbum(sendObject);
        }
        break;
    }

    if (statusCode === 200) {
      setPatchState("patched");
      setTimeout(() => {
        navigate(`/albums/${albumId}`);
      }, 1500);
    } else {
      alert("error");
    }
  };

  const fetchAlbum = async () => {
    const { album } = await getAlbum(albumId);
    console.log(album);
    createMapFromFetch(album);
  };

  const previewMapping = (event) => {
    const {
      target: { files },
    } = event;
    const fileMax =
      task === "edit" ? files.length + previews.length > 10 : files.length > 10;
    let finalFiles;
    if (fileMax) {
      event.preventDefault();
      event.target.value = null;
    } else {
      switch (task) {
        case "edit":
          const existing = previews.map((preview) => preview.name);
          const removeExisting = Array.from(files).filter(
            (file) => !existing.includes(file.name)
          );
          const previewMapped = Array.from(removeExisting).map(
            existingFileMapper(previews.length)
          );
          finalFiles = previews.concat(previewMapped);
          break;
        case "create":
          finalFiles = Array.from(files).map(fileMapper);
          break;
      }
    }
    setPreviews(finalFiles);
    setEditStep("edit");
  };

  const startOver = () => {
    if (task === "edit") {
      fetchAlbum();
      setMutateS3([]);
    } else {
      setPreviews(null);
    }
    setEditStep("upload");
    setEditMode(false);
    setIndex(0);
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

  const createMapFromFetch = (album) => {
    const { albumId, tags, title } = album;
    const fetchedPreviews = album.photos.map((item) => {
      const temp = {
        name: item.url.split(`${albumId}/`)[1].replace(/%20/g, " "),
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

  const shouldError =
    (previews !== null && previews.length === 0) || login === null;

  const shouldRender =
    (task === "edit" &&
      previews !== null &&
      previews.length > 0 &&
      login !== null) ||
    (task === "create" && login !== null);

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
                    task={task}
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

export default AlbumForm;
