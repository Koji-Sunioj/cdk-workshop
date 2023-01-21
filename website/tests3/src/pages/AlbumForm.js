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
import {
  getAlbum,
  patchAlbum,
  deleteObject,
  getSignedUrl,
  newAlbum,
} from "../utils/albumApi";
import { fileMapper, existingFileMapper } from "../utils/previewMapping";

import uuid from "react-uuid";
import { useState, useContext, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const AlbumForm = ({ task }) => {
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
    task === "edit" &&
      (() => {
        if (state !== null && state.hasOwnProperty("album")) {
          createMapFromFetch(state.album);
        } else {
          fetchAlbum();
        }
      })();
  }, [state]);

  //done
  const fetchAlbum = async () => {
    const { album } = await getAlbum(albumId);
    createMapFromFetch(album);
  };

  //done
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

  //done
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
