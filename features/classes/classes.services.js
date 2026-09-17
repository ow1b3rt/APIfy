import { StatusCodes } from "http-status-codes";

import HttpError from "../../common/errors/HttpError.js";
import { comparator } from "../../common/utils/patcher.js";
import { createClass, deleteClass, findClassById, getClasses, updateClass } from "./classes.repository.js";

/**
 * Find a class by ID
 */
export async function getSingleClassService(id) {
  const classData = await findClassById(id);
  return classData;
}

/**
 * Get all classes
 */
export async function getClassesService() {
  const classes = await getClasses()
  return classes;
}

/**
 * Create a new class
 */
export async function createClassService(data) {
  return await createClass(data);
}

/**
 * Update a class by ID
 */
export async function updateClassService(id, data) {
  const existingClass = await findClassById(id);
  if (!existingClass) {
    throw new HttpError("No class with such id", StatusCodes.NOT_FOUND);
  }

  const changes = comparator(existingClass, data)

  return updateClass({ id, ...changes });
}

/**
 * Delete a class by ID
 */
export async function deleteClassService(id) {
  const deletedClass = await deleteClass(id)
  if (!deletedClass) {
    throw new HttpError("No class with such id", StatusCodes.NOT_FOUND);
  }
  return deletedClass;
}
