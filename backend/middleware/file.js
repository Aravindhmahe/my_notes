const multer = require(`multer`);

const MIME_TYPE = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE[file.mimetype];
    let error = new Error("Invalid file type");
    if (isValid) {
      error = null;
    }
    cb(error, `backend/images`);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.split(" ").join("-");
    const ext = MIME_TYPE[file.mimetype];
    cb(null, fileName + "-" + Date.now() + "." + ext);
  },
});

module.exports = multer({ storage: storage }).single("image");
