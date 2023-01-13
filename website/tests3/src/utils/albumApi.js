import apiUrls from "../apis.json";

const { AlbumUrl } = apiUrls.CdkWorkshopStack;

export const getSignedUrl = async () => {
  const url = await fetch(AlbumUrl, {
    method: "GET",
  }).then((response) => response.json());
  return url;
};
