import apiUrls from "../apis.json";

const { AlbumInitUrl, AlbumUrl } = apiUrls.CdkWorkshopStack;

export const getSignedUrl = async (nameTypeToken) => {
  const { name, type, token } = nameTypeToken;
  const url = await fetch(AlbumInitUrl + `?key=${name}&content_type=${type}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => response.json());
  return url;
};

export const newAlbum = async (albumToken) => {
  const { album, token } = albumToken;
  const statusCode = await fetch(AlbumUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(album),
  }).then((response) => response.status);
  return statusCode;
};

export const getAlbums = async (params) => {
  const { page, direction, sort, query } = params;
  let urlQuery = `${AlbumUrl}?page=${page}&direction=${direction}&sort=${sort}`;
  if (query) {
    urlQuery = `${urlQuery}&query=${query}`;
  }

  const albums = await fetch(urlQuery, {
    method: "GET",
  }).then((response) => response.json());
  return albums;
};

export const getAlbum = async (albumId) => {
  const album = await fetch(`${AlbumUrl}/${albumId}`, { method: "GET" }).then(
    (response) => response.json()
  );
  return album;
};

export const patchAlbum = async (albumTokenAlbumId) => {
  const { album, token, albumId } = albumTokenAlbumId;
  const statusCode = await fetch(`${AlbumUrl}/${albumId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(album),
  }).then((response) => response.status);
  return statusCode;
};

export const deleteAlbum = async (albumIdToken) => {
  const { albumId, token } = albumIdToken;
  const statusCode = await fetch(`${AlbumUrl}/${albumId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => response.status);
  return statusCode;
};

export const deleteObject = async (albumidTokens3Object) => {
  const { albumId, token, s3Object } = albumidTokens3Object;
  const statusCode = await fetch(`${AlbumUrl}/${albumId}/${s3Object}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => response.status);
  return statusCode;
};
