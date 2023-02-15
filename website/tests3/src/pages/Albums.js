import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/Container";
import Pagination from "react-bootstrap/Pagination";

import AlbumList from "../components/AlbumList";
import AlbumQuery from "../components/AlbumQuery";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

import CardSkeleton from "../components/CardSkeleton";
import { getAlbums, getTags } from "../utils/albumApi";

const Albums = ({ filterToggle }) => {
  const queryRef = useRef();
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pages, setPages] = useState([]);
  const [queryTags, setQueryTags] = useState(null);
  const [albums, setAlbums] = useState(null);
  const [loading, setLoading] = useState(false);
  const [getting, setGetting] = useState(false);
  const [fetchFlag, setFetchFlag] = useState("init");

  const queryParams = {
    page: Number(searchParams.get("page")) || 1,
    direction: searchParams.get("direction") || "descending",
    sort: searchParams.get("sort") || "created",
    type: searchParams.get("type") || "text",
  };
  let query = searchParams.get("query") || "";
  let pathname = null;

  if (query.length > 0) {
    queryParams.query = query;
  }
  if (state !== null && state.hasOwnProperty("currentLocation")) {
    ({
      currentLocation: { pathname },
    } = state);
  }

  useEffect(() => {
    if (albums === null && fetchFlag === "init") {
      setLoading(true);
      fetchAlbums();
      fetchTags();
      setSearchParams(queryParams);
    } else if (fetchFlag === "get") {
      setGetting(true);
      fetchAlbums();
    } else if (pathname === "/albums") {
      document.getElementById("filter").value = "";
      setGetting(true);
      fetchAlbums();
      setSearchParams(queryParams);
    } else {
      loading && setLoading(false);
      getting &&
        setTimeout(() => {
          setGetting(false);
        }, 250);
    }
  }, [albums, fetchFlag, pathname]);

  console.log("rendered");

  const fetchTags = async () => {
    const { tags } = await getTags();
    setQueryTags(tags);
  };

  const fetchAlbums = async () => {
    const { albums, pages: fetchedPages } = await getAlbums(queryParams);
    const realPages = new Array(Number(fetchedPages))
      .fill(null)
      .map((v, n) => n + 1);
    setAlbums(albums);
    if (realPages.length !== pages.length) {
      setPages(realPages);
    }
    setFetchFlag("fetched");
  };

  const mutateParams = (fields) => {
    fields.forEach((value) => {
      queryParams[value.field] = value.value;
    });
    setSearchParams(queryParams);
    setFetchFlag("get");
  };

  const createQuery = (event) => {
    event.preventDefault();
    const {
      filter: { value: filter },
    } = event.currentTarget;
    switch (type) {
      case "text":
        mutateParams([
          { field: "query", value: filter },
          { field: "page", value: 1 },
        ]);
        break;
      case "tags":
        const refined = query.length > 0 ? query + "," + filter : filter;
        document.getElementById("filter").value = "";
        queryRef.current.setAttribute("disabled", true);
        mutateParams([
          { field: "query", value: refined },
          { field: "page", value: 1 },
        ]);
        break;
      default:
        return null;
    }
  };

  const shouldRender = albums !== null && albums.length > 0;
  const { page, direction, sort, type } = queryParams;

  return (
    <Container>
      <AlbumQuery
        filterToggle={filterToggle}
        type={type}
        queryParams={queryParams}
        mutateParams={mutateParams}
        createQuery={createQuery}
        queryRef={queryRef}
        getting={getting}
        sort={sort}
        direction={direction}
        query={query}
        queryTags={queryTags}
      />
      {loading &&
        [1, 3].map((value) => (
          <Row key={value}>
            {[1, 2, 3].map((row) => (
              <Col lg={4} key={row}>
                <CardSkeleton />
              </Col>
            ))}
          </Row>
        ))}
      {albums !== null && albums.length === 0 && (
        <h3>No Albums match that query</h3>
      )}
      {shouldRender && (
        <AlbumList query={query} albums={albums} mutateParams={mutateParams} />
      )}
      <Pagination>
        {pages.length > 0 &&
          pages.map((number) => (
            <Pagination.Item
              key={number}
              active={number === page}
              onClick={() => {
                mutateParams([{ field: "page", value: number }]);
                window.scrollTo(0, 0);
              }}
            >
              {number}
            </Pagination.Item>
          ))}
      </Pagination>
    </Container>
  );
};

export default Albums;
