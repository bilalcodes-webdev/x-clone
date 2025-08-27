import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images file are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter,
  limits: { fileSize: 5 * 1021 * 1024 },
});

export default upload;
