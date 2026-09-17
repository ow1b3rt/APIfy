import {
  insertCareerSchema,
  updateCareerSchema,
  selectCareerSchema,
} from "./career_schema.js";
import fs from "fs";
import {
  commonCreateService,
  commonGetService,
  commonGetSingleService,
  commonUpdateService,
  commonDeleteService,
} from "#/common/feature/common.services.js";

import { careers } from "./careers.db.js";
import { jobs } from "../jobs/jobs.db.js";
import { StatusCodes } from "http-status-codes";
import { createMediaSchema } from "#/features/media/media.schema.js";
import { media } from "#/db/schema/index.js";
import { parseBody } from "#/common/utils/parse.js";
import { join, joinMany } from "#/common/utils/queryhelper.js";
import { eq, getTableColumns } from "drizzle-orm";
import { buildWhereFromQuery } from "#/common/utils/queryhelper.js";

function careersWithMedia() {
  return joinMany(
    careers,
    [
      {
        table: media,
        on: eq(careers.resume, media.id),
        type: "left",
      },
      {
        table: jobs,
        on: eq(careers.job_id, jobs.id),
        type: "left",
      },
    ],
    {
      name: "careers",
      fields: {
        ...getTableColumns(careers),
        resumeUrl: media.url,
        jobTitle: jobs.title,
      },
    },
  );
}
export async function createCareerController(req, res) {
  const file = req.files?.resume || req.files?.documents;

  if (!file?.[0]) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Resume file is required",
    });
  }

  let url = file?.[0]?.path.split("/").slice(-3).join("/");
  url = "/" + url;

  let mediaResult;
  try {
    const mediaData = parseBody(createMediaSchema, {
      url,
      alt: file[0].originalname,
      title: file[0].originalname,
      type: file[0].mimetype === "application/pdf" ? "pdf" : "docx",
    });
    mediaResult = await commonCreateService(media, mediaData);
  } catch (err) {
    fs.unlink(file[0].path, () => {});
    throw err;
  }

  try {
    const careerData = parseBody(insertCareerSchema, {
      ...req.body,
      resume: mediaResult.id,
    });

    const result = await commonCreateService(careers, careerData);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Application submitted successfully",
      ...result,
    });
  } catch (err) {
    fs.unlink(file[0].path, () => {});
    await commonDeleteService(media, mediaResult.id);
    throw err;
  }
}

export async function getCareerController(req, res) {
  const searchFields = [careers.full_name, careers.email, careers.phone];

  const filters = ["status", "job_id", "jobTitle"];

  const query = {
    search: req.query.search,
    page: req.query.page,
    pageSize: req.query.pageSize,
    searchFields: searchFields,
    orderBy: undefined,
    where: buildWhereFromQuery(careers, req.query, filters),
  };
  const result = await commonGetService(careersWithMedia(), query);

  res.status(StatusCodes.OK).json({
    success: true,
    ...result,
  });
}

export async function updateCareerController(req, res) {
  const data = parseBody(updateCareerSchema, req.body);

  const result = await commonUpdateService(careers, req.params.id, data);

  res.status(StatusCodes.OK).json({
    success: true,
    career: result,
  });
}

export async function deleteCareerController(req, res) {
  const result = await commonDeleteService(careers, req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    career: result,
  });
}

export async function getSingleCareerController(req, res) {
  const result = await commonGetSingleService(
    careersWithMedia(),
    req.params.id,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    resource: "careers",
    item: result,
  });
}

// // Apply for job

// export async function applyCareerController(req,res){

//     const {data}= insertCareerSchema.selfparse(req.body)

// }
