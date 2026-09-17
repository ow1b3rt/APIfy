import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import HttpError from "../../common/errors/HttpError.js";
import { StatusCodes } from "http-status-codes";

const uploadFolders = {
  profilePics: "profile_pics",
  documents: "documents",
  thumbnails: "thumbnails",
  media: "media",
  resume: "resumes",
};

/*
|--------------------------------------------------------------------------
| Ensure Upload Directory Exists
|--------------------------------------------------------------------------
|
| Automatically creates folders if missing.
|
*/

const ensureUploadPath = (folder) => {
  const uploadPath = path.join(process.cwd(), "public", "uploads", folder);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {
      recursive: true,
    });
  }

  return uploadPath;
};

/*
|--------------------------------------------------------------------------
| Allowed File Types
|--------------------------------------------------------------------------
|
| Restricts uploads to supported image and document formats.
|
*/

const imageTypes = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);
const documentTypes = new Map([
  [".pdf", "application/pdf"],
  [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
]);

/*
|--------------------------------------------------------------------------
| Multer Storage Configuration
|--------------------------------------------------------------------------
*/

const storage = multer.diskStorage({
  /*
    |--------------------------------------------------------------------------
    | Destination Resolver
    |--------------------------------------------------------------------------
    |
    | Dynamically determines upload folder based on field name.
    |
    */

  destination: (req, file, cb) => {
    const folder = uploadFolders[file.fieldname];

    /*
        |--------------------------------------------------------------------------
        | Reject Unknown Upload Fields
        |--------------------------------------------------------------------------
        |
        | Prevents accidental uploads
        | to undefined destinations.
        |
        */

    if (!folder) {
      return cb(
        new HttpError(
          `Invalid upload field: ${file.fieldname}`,
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    cb(null, ensureUploadPath(folder));
  },

  /*
    |--------------------------------------------------------------------------
    | File Naming Strategy
    |--------------------------------------------------------------------------
    |
    | Uses UUID to avoid collisions.
    |
    | Example:
    |   8d3d8f3f-....png
    |
    */

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const uniqueName = `${uuidv4()}${extension}`;

    cb(null, uniqueName);
  },
});

/*
|--------------------------------------------------------------------------
| File Filter
|--------------------------------------------------------------------------
|
| Validates both MIME type and file extension.
|
*/

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const allowedTypes = ["profilePics", "thumbnails", "media"].includes(file.fieldname)
    ? imageTypes
    : file.fieldname === "resume"
      ? new Map([...documentTypes].filter(([extension]) => extension !== ".xlsx"))
      : documentTypes;

  if (allowedTypes.get(extension) !== file.mimetype) {
    return cb(
      new HttpError("Unsupported file format", StatusCodes.BAD_REQUEST),
    );
  }

  cb(null, true);
};

/*
|--------------------------------------------------------------------------
| Multer Upload Middleware
|--------------------------------------------------------------------------
|
| Supports:
|   upload.single()
|   upload.array()
|   upload.fields()
|
*/

const upload = multer({
  storage,

  fileFilter,

  /*
    |--------------------------------------------------------------------------
    | Upload Limits
    |--------------------------------------------------------------------------
    */

  limits: {
    // 20 MB per file

    fileSize: 20 * 1024 * 1024,
  },
});

export default upload;
