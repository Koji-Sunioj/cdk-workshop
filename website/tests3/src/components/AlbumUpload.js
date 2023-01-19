import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/esm/Stack";
import Button from "react-bootstrap/esm/Button";

import { useNavigate } from "react-router-dom";

const AlbumUpload = ({ previewMapping, task, setStep = null }) => {
  const navigate = useNavigate();
  const title =
    task === "edit"
      ? "Add images to your existing album"
      : "Upload images to a new album";

  return (
    <>
      <h2>{title}</h2>
      <Form.Group className="mb-3">
        <Form.Label>Upload your files (max 10)</Form.Label>
        <Form.Control
          id="fileInput"
          type="file"
          name="upload"
          accept="image/*"
          multiple
          onChange={previewMapping}
        />
        {task === "edit" && (
          <Form.Text className="text-muted">
            Images which already exist in your album will be ignored
          </Form.Text>
        )}
      </Form.Group>
      {task === "edit" && (
        <Stack direction="horizontal" gap={3}>
          <Button
            onClick={() => {
              navigate(-1);
            }}
          >
            Go back
          </Button>
          <Button
            onClick={() => {
              setStep("edit");
            }}
          >
            Next
          </Button>
        </Stack>
      )}
    </>
  );
};

export default AlbumUpload;
