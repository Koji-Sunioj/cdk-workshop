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

export const getAlbums = async () => {
  const albums = await fetch(AlbumUrl, { method: "GET" }).then((response) =>
    response.json()
  );
  return albums;
};
