import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";
import multer from "multer";

import {
  parseForeignKeyDetail,
  parseUniqueViolationDetail,
  humanizeField,
} from "./helper.js";

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ success: false, message: "Malformed JSON body" });
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Uploaded file is too large" : err.message;
    return res.status(400).json({ success: false, message });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof DrizzleQueryError && err.cause instanceof DatabaseError) {
    const pgErr = err.cause;

    switch (pgErr.code) {
      case "23505": {
        // unique_violation

        const parsed = parseUniqueViolationDetail(pgErr.detail);
        const message = parsed
          ? `${humanizeField(parsed.column)} "${parsed.value}" is already taken`
          : "This value already exists";

        return res.status(409).json({ success: false, message });
      }

      case "23503": {
        // foreign_key_violation
        const parsed = parseForeignKeyDetail(pgErr.detail);
        const message = parsed
          ? `${humanizeField(parsed.column)} "${parsed.value}" does not exist`
          : "Referenced record does not exist";
        return res.status(400).json({ success: false, message });
      }

      case "23502": {
        // not_null_violation
        const message = `${humanizeField(pgErr.column)} is required`;
        return res.status(400).json({ success: false, message });
      }

      case "22P02": // invalid_text_representation
        return res.status(400).json({
          success: false,
          message: "Invalid input value",
        });

      default:
        console.error("Unhandled Postgres error:", pgErr);
        return res.status(500).json({
          success: false,
          message: "Database error",
        });
    }
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: err.statusCode ? err.message : "Something went wrong",
  });
};

export default errorHandler;
