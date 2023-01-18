import Card from "react-bootstrap/Card";

import { filler } from "../utils/styles";

const CardSkeleton = () => {
  return (
    <>
      <Card className="mb-3">
        <Card.Img
          variant="top"
          src={"https://via.placeholder.com/400x400.png?text=Loading"}
        />

        <Card.Body>
          <Card.Title style={filler}>&nbsp;</Card.Title>
          <Card.Subtitle className="mb-2 text-muted" style={filler}>
            &nbsp;
          </Card.Subtitle>
          <Card.Text style={filler}>&nbsp;</Card.Text>
        </Card.Body>
      </Card>
    </>
  );
};

export default CardSkeleton;
