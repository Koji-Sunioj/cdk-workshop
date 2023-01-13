import apiUrls from "../apis.json";

const { AlbumUrl } = apiUrls.CdkWorkshopStack;
export const getSignedUrl = async (nameTypeToken) => {
  const { name, type, token } = nameTypeToken;
  const url = await fetch(AlbumUrl + `?key=${name}&content_type=${type}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => response.json());
  return url;
};
