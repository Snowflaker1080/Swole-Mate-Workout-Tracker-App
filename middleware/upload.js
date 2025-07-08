import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(process.cwd(), "public/uploads/exercises")),
  filename: (req, file, cb) => {

    // API id + timestamp to avoid collisions
    const ext = path.extname(file.originalname);
    cb(null, `${req.body.apiId || req.params.apiId}-${Date.now()}${ext}`);
  }
});

export const upload = multer({ storage });