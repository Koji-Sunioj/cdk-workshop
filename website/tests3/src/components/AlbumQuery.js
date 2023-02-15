import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Button from "react-bootstrap/esm/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Collapse from "react-bootstrap/esm/Collapse";

const AlbumQuery = ({
  filterToggle,
  type,
  queryParams,
  mutateParams,
  createQuery,
  queryRef,
  getting,
  queryTags,
  sort,
  direction,
  query,
}) => {
  const shouldDisabled =
    (type === "text" && query.length === 0) || type === "tags";

  return (
    <Collapse in={filterToggle}>
      <div>
        <Row>
          <Col lg={3} className="mb-2">
            <Form.Label>Filter type</Form.Label>
            <div
              style={{
                padding: "0.375rem 0.75rem",
                border: "1px solid #ced4da",
                borderRadius: "8px",
              }}
            >
              <div>
                <Form.Check
                  inline
                  label="Free text"
                  name="queryFilter"
                  type="radio"
                  checked={type === "text"}
                  onChange={() => {
                    mutateParams({ type: "text" }, "radio");
                  }}
                />
                <Form.Check
                  inline
                  label="Tags"
                  name="tagsFilter"
                  type="radio"
                  checked={type === "tags"}
                  onChange={() => {
                    mutateParams({ type: "tags" }, "radio");
                  }}
                />
              </div>
            </div>
          </Col>
          <Col lg={3} className="mb-2">
            <Form onSubmit={createQuery}>
              <Form.Label>Search</Form.Label>
              <InputGroup>
                <Button ref={queryRef} disabled={shouldDisabled} type="submit">
                  Go
                </Button>
                {type === "text" && (
                  <Form.Control
                    disabled={getting}
                    name="filter"
                    id="filter"
                    type="text"
                    placeholder="nature, israel, photography..."
                    defaultValue={query}
                    onChange={(e) => {
                      const {
                        currentTarget: { value },
                      } = e;
                      if (value.length === 0) {
                        delete queryParams.query;
                        queryRef.current.setAttribute("disabled", true);
                        mutateParams({ page: 1 });
                      } else {
                        queryRef.current.removeAttribute("disabled");
                      }
                    }}
                  />
                )}
                {type === "tags" && (
                  <>
                    <Form.Control
                      disabled={getting}
                      name="filter"
                      id="filter"
                      placeholder="nature, israel, photography..."
                      list="tags"
                      onChange={(event) => {
                        const {
                          currentTarget: { value },
                        } = event;
                        if (value.length === 0) {
                          queryRef.current.setAttribute("disabled", true);
                        } else if (queryTags.includes(value)) {
                          queryRef.current.removeAttribute("disabled");
                        }
                      }}
                    />
                    <datalist id="tags" autoComplete="off">
                      {queryTags !== null &&
                        queryTags.map((tag) => {
                          let option = null;
                          if (!query.split(",").includes(tag)) {
                            option = <option value={tag} key={tag} />;
                          }
                          return option;
                        })}
                    </datalist>
                  </>
                )}
              </InputGroup>
            </Form>
          </Col>

          <Col lg={3} className="mb-2">
            <Form.Label>Sort by</Form.Label>
            <Form.Select
              value={sort}
              disabled={getting}
              onChange={(event) => {
                const {
                  currentTarget: { value },
                } = event;
                mutateParams({ sort: value });
              }}
            >
              {["created", "title", "userName"].map((field) => (
                <option key={field} value={field}>
                  {field.toLocaleLowerCase()}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col lg={3} className="mb-2">
            <Form.Label>Direction</Form.Label>
            <Form.Select
              disabled={getting}
              value={direction}
              onChange={(event) => {
                const {
                  currentTarget: { value },
                } = event;
                mutateParams({ direction: value });
              }}
            >
              {["descending", "ascending"].map((field) => (
                <option key={field} value={field}>
                  {field.toLocaleLowerCase()}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        {type === "tags" && query.length > 0 && (
          <Row className="mb-2">
            <Col>
              {query.split(",").map((tag) => (
                <Button
                  variant="info"
                  key={tag}
                  style={{ margin: "3px" }}
                  onClick={() => {
                    const currentQuery = query.split(",");
                    const index = currentQuery.indexOf(tag);
                    currentQuery.splice(index, 1);
                    let mutateObject = { page: 1 };
                    if (currentQuery.length === 0) {
                      delete queryParams.query;
                    } else {
                      mutateObject.query = currentQuery.join(",");
                    }
                    mutateParams(mutateObject);
                  }}
                >
                  {tag}
                </Button>
              ))}
            </Col>
          </Row>
        )}
      </div>
    </Collapse>
  );
};

export default AlbumQuery;
