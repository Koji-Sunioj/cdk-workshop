import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/esm/Button";

const AlbumEdit = ({ setEditMode, setUploadStep, setPreviews }) => {
  return (
    <>
      <h2>Your gallery</h2>
      <Form.Group className="mb-3">
        <Form.Check
          label="edit mode"
          onChange={(e) => {
            const { checked } = e.currentTarget;
            setEditMode(checked);
          }}
        />
      </Form.Group>
      <div
        className="mb-3"
        style={{
          paddingTop: "10px",
          display: "flex",
          flexDirection: "row",
          gap: "10px",
        }}
      >
        <Button type="submit" variant="primary">
          Submit
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setPreviews([]);
            setUploadStep("upload");
            setEditMode(false);
          }}
        >
          Start over
        </Button>
      </div>
    </>
  );
};

export default AlbumEdit;
