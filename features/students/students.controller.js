import { StatusCodes } from "http-status-codes";

import HttpError from "../../common/errors/HttpError.js";
import { env } from "../../config/env.js";
import { parseBody } from "../../common/utils/parse.js";
import { studentCreateSchema, updateStudentSchema } from "./students.schema.js";
import {
  registerStudent,
  getStudentService,
  updateStudentService,
  getSingleStudentService,
  deleteStudentService,
} from "./students.services.js";
import { commonGetService } from "../../common/feature/common.services.js";
import { students } from "../../db/schema/index.js";
import { buildWhereFromQuery } from "../../common/utils/queryhelper.js";

export async function createStudent(req, res) {
  const data = parseBody(studentCreateSchema, req.body);

  const result = await registerStudent(data);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Registration Successful",
    student: result.student,
    classes: result.classes,
  });
}

export async function getStudents(req, res) {
  const allowFilters = ["phone"];
  const query = {
    search: req.query.search,
    page: req.query.page,
    pageSize: req.query.pageSize,
    searchFields: [students.name, students.email],
    where: buildWhereFromQuery(students, req.query, allowFilters),
  };

  const result = await commonGetService(students, query);

  res.status(StatusCodes.OK).json({
    success: true,
    resource: "students",
    ...result,
  });
}

export async function updateStudent(req, res) {
  const { id } = req.params;

  const data = parseBody(updateStudentSchema, req.body);
  const result = await updateStudentService({ ...data, id });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Updated Successfully",
    ...result,
  });
}

export async function getSingleStudent(req, res) {
  const { id } = req.params;

  const { student, classes } = await getSingleStudentService(id);

  res.status(StatusCodes.OK).json({
    success: true,
    item: { ...student, classes },
  });
}

export async function deleteStudent(req, res) {
  const { id } = req.params;

  const result = await deleteStudentService(id);

  res.status(StatusCodes.OK).json({
    success: true,
    ...result,
  });
}
