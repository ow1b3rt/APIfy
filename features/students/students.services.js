import { StatusCodes } from "http-status-codes";

import HttpError from "../../common/errors/HttpError.js";
import {
  findStudentByEmail,
  findStudentById,
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
} from "./students.repository.js";
import { comparator } from "#/common/utils/patcher.js";
import {
  getClassesIdForStudent,
  getClassesForStudent,
  addClassForStudent,
  removeClassForStudent,
} from "../classes/classes.repository.js";
import { diffIds } from "#/common/utils/diffid.js";
import { db } from "#/config/db.js";

export async function registerStudent(data) {
  const existingStudent = await findStudentByEmail(data.email);

  if (existingStudent) {
    throw new HttpError("Email is already registered", StatusCodes.CONFLICT);
  }

  const { classes: classIds, ...studentData } = data;
  return db.transaction(async (tx) => {
    const student = await createStudent(studentData, tx);
    const classes = [];

    for (const classId of classIds) {
      const classData = await addClassForStudent(student.id, classId, tx);
      classes.push(classData);
    }

    return { student, classes };
  });
}

//=================================================================================================

export async function getStudentService() {
  const students = await getStudents();

  return { students };
}

//=================================================================================================

export async function updateStudentService(data) {
  const existingStudent = await findStudentById(data.id);

  if (!existingStudent) {
    throw new HttpError("No student with such id", StatusCodes.NOT_FOUND);
  }

  const { id, classes: requestedClasses, ...studentData } = data;
  const changes = comparator(existingStudent, studentData);
  const student = Object.keys(changes).length
    ? await updateStudent(id, changes)
    : existingStudent;

  if (requestedClasses === undefined) {
    return { student, classUpdates: { add: [], remove: [] } };
  }

  const existingClasses = await getClassesIdForStudent(id);
  const existingClassesIds = existingClasses.map((c) => c.classId);

  const classUpdates = diffIds(existingClassesIds, requestedClasses);

  if (classUpdates.remove.length > 0) {
    for (const classId of classUpdates.remove) {
      await removeClassForStudent(student.id, classId);
    }
  }

  if (classUpdates.add.length > 0) {
    for (const classId of classUpdates.add) {
      await addClassForStudent(student.id, classId);
    }
  }

  return { student, classUpdates };
}

//=================================================================================================

export async function getSingleStudentService(id) {
  const student = await findStudentById(id);

  if (!student) {
    throw new HttpError("No student with such id", StatusCodes.NOT_FOUND);
  }

  const classes = await getClassesForStudent(id);

  return { student, classes };
}

export async function deleteStudentService(id) {
  const student = await deleteStudent(id);

  if (!student) {
    throw new HttpError("No student with such id", StatusCodes.NOT_FOUND);
  }

  return student;
}
