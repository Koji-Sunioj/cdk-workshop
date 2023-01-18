import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/esm/Container";

import { globalContext } from "../App";
import { getAlbum } from "../utils/albumApi";
import AlbumEdit from "../components/AlbumEdit";
import AlbumUpload from "../components/AlbumUpload";
import UploadCarousel from "../components/UploadCarousel";

import { useEffect, useState, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";

const EditAlbum = () => {
  const { albumId } = useParams();
  const { state } = useLocation();
  const [index, setIndex] = useState(0);
  const [login] = useContext(globalContext);
  const [editMode, setEditMode] = useState(false);
  const [editStep, setEditStep] = useState("upload");
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

  const createMapFromFetch = (album) => {
    const { albumId } = album;
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

  const reOrder = () => {
    console.log("reoder");
  };

  const mutateCopy = () => {
    console.log("reoder");
  };

  const deletePicture = () => {
    console.log("reoder");
  };

  const startOver = () => {
    setEditStep("upload");
    const filtered = previews.filter((preview) => preview.type === "s3Object");
    setPreviews(filtered);
    setEditMode(false);
  };

  const shouldError = previews !== null && previews.length === 0;
  const shouldRender =
    previews !== null && previews.length > 0 && login !== null;
  const editAble =
    previews !== null && previews.length > 0 && editStep === "edit";
  return (
    <Container>
      {shouldRender && (
        <Row>
          <Col lg="5">
            <Form encType="multipart/form-data">
              <fieldset>
                {editStep === "upload" && (
                  <AlbumUpload
                    defaultTitle="Add images to your existing album"
                    previewMapping={previewMapping}
                    subtitle="images with the same name will be removed"
                  />
                )}
                {editAble && (
                  <AlbumEdit
                    setEditMode={setEditMode}
                    setUploadStep={setEditStep}
                    startOver={startOver}
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
