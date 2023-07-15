import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/Container";
import Pagination from "react-bootstrap/Pagination";

import AlbumList from "../components/AlbumList";
import AlbumQuery from "../components/AlbumQuery";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

import CardSkeleton from "../components/CardSkeleton";
import { getAlbums } from "../utils/albumApi";

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

  let queryParams = {
    page: Number(searchParams.get("page")) || 1,
    direction: searchParams.get("direction") || "descending",
    sort: searchParams.get("sort") || "created",
    type: searchParams.get("type") || "text",
  };
  let query = searchParams.get("query") || "";
  let isFromSamePage = false;

  if (query.length > 0) {
    queryParams.query = query;
  }
  if (state !== null && state.hasOwnProperty("path")) {
    const { path } = state;
    isFromSamePage = path === "/albums";
  }

  useEffect(() => {
    if (albums === null && fetchFlag === "init") {
      setLoading(true);
      fetchAlbums();

      setSearchParams(queryParams);
    } else if (fetchFlag === "get") {
      setGetting(true);
      fetchAlbums();
    } else if (isFromSamePage) {
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
  }, [albums, fetchFlag, isFromSamePage]);

  const fetchAlbums = async () => {
    const { albums, pages: fetchedPages, tags } = await getAlbums(queryParams);
    setQueryTags(tags);
    const realPages = new Array(Number(fetchedPages))
      .fill(null)
      .map((v, n) => n + 1);
    setAlbums(albums);
    if (realPages.length !== pages.length) {
      setPages(realPages);
    }
    setFetchFlag("fetched");
  };

  const mutateParams = (newValues, origin = null) => {
    Object.assign(queryParams, newValues);
    switch (origin) {
      case "radio":
        if (queryParams.hasOwnProperty("query")) {
          delete queryParams.query;
          queryParams.page = 1;
          setFetchFlag("get");
        }
        break;
      default:
        setFetchFlag("get");
    }
    setSearchParams(queryParams);
  };

  const createQuery = (event) => {
    event.preventDefault();
    const {
      filter: { value: filter },
    } = event.currentTarget;
    switch (type) {
      case "text":
        mutateParams({ query: filter, page: 1 });
        break;
      case "tags":
        const refined = query.length > 0 ? `${query},${filter}` : filter;
        document.getElementById("filter").value = "";
        queryRef.current.setAttribute("disabled", true);
        mutateParams({ query: refined, page: 1 });
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
                mutateParams({ page: number });
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
