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
