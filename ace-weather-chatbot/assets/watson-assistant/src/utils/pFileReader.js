export const pFileReader = (file) => {
  return new Promise((resolve, reject) => {
    var fr = new FileReader();
    fr.onloadend = (evf) => {
      resolve({ file: file, data: evf.target.result });
    };
    fr.onerror = (err) => {
      reject({ err, file });
    };
    fr.readAsDataURL(file);
  });
};
