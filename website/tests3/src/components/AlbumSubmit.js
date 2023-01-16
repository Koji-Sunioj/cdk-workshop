import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/esm/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Stack from "react-bootstrap/Stack";

import { useRef } from "react";

const AlbumSubmit = ({ setUploadStep, tags, setTags, formRef }) => {
  const tagRef = useRef();

  const pushTag = (tag) => {
    if (tag.length > 0 && !tags.includes(tag)) {
      const tagCopy = [...tags];
      tagCopy.push(tag);
      setTags(tagCopy);
      tagRef.current.value = "";
    }
  };

  return (
    <>
      <h2>Your gallery</h2>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Album title"
          name="title"
          required
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              formRef.current.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
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

      <div
        className="mb-3"
        style={{
          paddingTop: "10px",
          display: "flex",
          flexDirection: "row",
          gap: "10px",
        }}
      >
        <Button
          variant="primary"
          onClick={() =>
            formRef.current.dispatchEvent(
              new Event("submit", { cancelable: true, bubbles: true })
            )
          }
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
      </div>
      {tags.length > 0 && <p>Your tags:</p>}
      <Stack direction="horizontal" gap={3}>
        {tags.map((tag) => (
          <Button
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
    </>
  );
};

export default AlbumSubmit;
