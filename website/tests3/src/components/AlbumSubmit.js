import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/esm/Button";
import InputGroup from "react-bootstrap/InputGroup";

import { postStatePointer } from "../utils/pointers";

import { useRef, useState } from "react";

const AlbumSubmit = ({
  setUploadStep,
  tags,
  setTags,
  formRef,
  postState,
  title,
  setTitle,
}) => {
  const tagRef = useRef();
  const titleRef = useRef();
  const [alertState, setAlertState] = useState(false);
  const pushTag = (tag) => {
    if (tag.length > 0 && !tags.includes(tag)) {
      const tagCopy = [...tags];
      tagCopy.push(tag);
      setTags(tagCopy);
      tagRef.current.value = "";
    }
  };

  let message, variant, shouldAlert;
  if (postState !== "idle") {
    ({ message, variant } = postStatePointer[postState]);
    shouldAlert = true;
  }

  return (
    <>
      <h2>Your gallery</h2>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          defaultValue={title}
          placeholder="Album title"
          name="title"
          ref={titleRef}
          onKeyUp={() => {
            setTitle(titleRef.current.value);
          }}
          onKeyPress={(e) => {
            const properLength = e.currentTarget.value.length > 0;
            const entered = e.key === "Enter";

            if (entered && properLength) {
              setAlertState(false);
              formRef.current.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
            } else if (entered && !properLength) {
              setAlertState(true);
            }
          }}
        />
      </Form.Group>
      <InputGroup className="mb-3">
        <Button
          variant="primary"
          onClick={() => {
            const {
              current: { value: tag },
            } = tagRef;
            pushTag(tag);
          }}
        >
          Add tag
        </Button>
        <Form.Control
          type="text"
          placeholder="nature, photography, family..."
          name="tags"
          ref={tagRef}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              const {
                current: { value: tag },
              } = tagRef;
              pushTag(tag);
            }
          }}
        />
      </InputGroup>
      <Stack gap={3} direction="horizontal" className="mb-3">
        <Button
          variant="primary"
          onClick={() => {
            if (titleRef.current.value.length > 0) {
              setAlertState(false);
              formRef.current.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
            } else {
              setAlertState(true);
            }
          }}
        >
          Submit
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setUploadStep("edit");
          }}
        >
          Go back
        </Button>
      </Stack>
      {tags.length > 0 && (
        <div className="mb-3">
          <p>Your tags:</p>
          <Stack direction="horizontal" gap={3} className="mb-3">
            {tags.map((tag) => (
              <Button
                key={tag}
                variant="info"
                onClick={() => {
                  const filtered = tags.filter((item) => item !== tag);
                  setTags(filtered);
                }}
              >
                {tag}
              </Button>
            ))}
          </Stack>
        </div>
      )}
      {shouldAlert && <Alert variant={variant}>{message}</Alert>}
      {alertState && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setAlertState(false)}
        >
          Input a title plz
        </Alert>
      )}
    </>
  );
};

export default AlbumSubmit;
