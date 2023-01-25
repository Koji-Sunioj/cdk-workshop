import Card from "react-bootstrap/Card";
import Placeholder from "react-bootstrap/Placeholder";

const CardSkeleton = () => {
  return (
    <>
      <Card className="mb-3">
        <Card.Img
          variant="top"
          src={"https://via.placeholder.com/400x400.png?text=Loading"}
        />
        <Card.Body>
          <Placeholder as={Card.Title} animation="glow">
            <Placeholder xs={6} />
          </Placeholder>
          <Placeholder as={Card.Subtitle} animation="glow">
            <Placeholder xs={6} />
          </Placeholder>
          <Placeholder as={Card.Text} animation="glow">
            <Placeholder xs={6} />
          </Placeholder>
        </Card.Body>
      </Card>
    </>
  );
};

export default CardSkeleton;
