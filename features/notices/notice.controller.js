import { StatusCodes } from "http-status-codes";
import {
  commonCreateService,
  commonDeleteService,
  commonGetService,
  commonGetSingleService,
} from "../../common/feature/common.services.js";
import { notices } from "../../db/schema/index.js";
import { createNoticeSchema } from "./notice.schema.js";
import { commonUpdateService } from "../../common/feature/common.services.js";
import { parseBody } from "../../common/utils/parse.js";
import { updateNoticeSchema } from "./notice.schema.js";

export async function createNoticeController(req, res) {
  const data = parseBody(createNoticeSchema, req.body);

  const result = await commonCreateService(notices, data);

  res.status(StatusCodes.CREATED).json({
    success: true,
    notice: result,
  });
}

export async function getNoticesController(req, res) {
  const result = await commonGetService(notices);

  res.status(StatusCodes.OK).json({
    success: true,
    notices: result,
  });
}

export async function getSingleNoticeController(req, res) {
  const { id } = req.params;
  const result = await commonGetSingleService(notices, id);

  res.status(StatusCodes.OK).json({
    success: true,
    item: result,
    resource: "noticeData",
  });
}

export async function deleteNoticeController(req, res) {
  const { id } = req.params;
  const result = await commonDeleteService(notices, id);

  res.status(StatusCodes.OK).json({
    success: true,
    notice: result,
  });
}

export async function updateNoticeController(req, res) {
  const { id } = req.params;
  const data = parseBody(updateNoticeSchema, req.body);
  const result = await commonUpdateService(notices, id, data);

  res.status(StatusCodes.OK).json({
    success: true,
    notice: result,
  });
}
