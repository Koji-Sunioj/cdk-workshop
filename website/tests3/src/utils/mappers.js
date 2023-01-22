import { deleteObject, getSignedUrl } from "./albumApi";

export const fileMapper = (file, i) => {
  return {
    name: file.name,
    type: file.type,
    file: file,
    blob: URL.createObjectURL(file),
    closed: true,
    text: null,
    order: i + 1,
  };
};

export const responseMapper = (response) => {
  const { url, text, order } = response;
  return { url: url, text: text, order: order };
};

export const previewMapper = (preview) => {
  const { blob, text, order } = preview;
  return { url: blob, text: text, order: order };
};

export const existingFileMapper = (existingLength) => {
  return (file, i) => {
    return {
      name: file.name,
      type: file.type,
      file: file,
      blob: URL.createObjectURL(file),
      closed: true,
      text: null,
      order: existingLength + i + 1,
    };
  };
};

export const deleteS3Mapper = (albumIdToken) => {
  const { albumId, token } = albumIdToken;
  return async (key) => {
    const statusCode = await deleteObject({
      s3Object: key,
      token: token,
      albumId: albumId,
    });
    return statusCode === 200;
  };
};

export const putS3Mapper = (albumIdToken) => {
  const { albumId, token } = albumIdToken;
  return async (item) => {
    const { name, type, file, text, order } = item;
    const newPath = `${albumId}/${name}`;
    const { url } = await getSignedUrl({
      name: newPath,
      type: type,
      token: token,
    });
    const response = await fetch(url, {
      method: "PUT",
      body: file,
    });
    const dynamoData = {
      url: response.url.split("?")[0],
      text: text,
      order: order,
      success: response.ok,
    };
    return dynamoData;
  };
};
