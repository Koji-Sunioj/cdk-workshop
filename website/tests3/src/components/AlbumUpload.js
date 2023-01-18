import Form from "react-bootstrap/Form";

const AlbumUpload = ({
  previewMapping,
  defaultTitle = "Create album",
  subtitle = null,
}) => {
  return (
    <>
      <h2>{defaultTitle}</h2>
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
        {subtitle !== null && (
          <Form.Text className="text-muted">{subtitle}</Form.Text>
        )}
      </Form.Group>
    </>
  );
};

export default AlbumUpload;
