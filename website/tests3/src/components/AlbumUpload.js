import Form from "react-bootstrap/Form";

const AlbumUpload = ({ previewMapping, setUploadStep }) => {
  return (
    <>
      <h2>Create album</h2>
      <Form.Group className="mb-3">
        <Form.Label>Upload your files (max 10)</Form.Label>
        <Form.Control
          id="fileInput"
          type="file"
          name="upload"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files.length > 10) {
              e.preventDefault();
              e.target.value = null;
            } else {
              previewMapping(e.target.files);
              setUploadStep("edit");
            }
          }}
        />
      </Form.Group>
    </>
  );
};

export default AlbumUpload;
