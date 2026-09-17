import { StatusCodes } from "http-status-codes";
import { commonCreateService } from "../../common/feature/common.services.js";
import { parseBody } from "../../common/utils/parse.js";
import { media } from "../../db/schema/index.js";
import { createMediaSchema } from "./media.schema.js";
import HttpError from "../../common/errors/HttpError.js";

export async function createMediaController(req, res) {
    const file =
        req.files?.media ||
        req.files?.profilePics ||
        req.files?.thumbnails ||
        req.files?.documents;

    if (!file?.[0]) {
      throw new HttpError("A media file is required", StatusCodes.BAD_REQUEST);
    }

    let url = file?.[0]?.path.split("/").slice(-3).join("/");



    url = "/" + url;

    req.body.url = url
    if (!req.body.type) {
      req.body.type = file[0].mimetype.startsWith("image/")
        ? "image"
        : file[0].mimetype === "application/pdf"
          ? "pdf"
          : "docx";
    }

    const data = parseBody(createMediaSchema, req.body);

    const result = await commonCreateService(media, data)

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Media uploaded successfuly",
        media: result
    })

}
