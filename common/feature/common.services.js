import HttpError from "../errors/HttpError.js";
import { StatusCodes } from "http-status-codes";
import {
  commonFindAll, commonFindById, commonCreate, commonUpdate, commonDelete,
  commonFindBySlug
} from "./common.repository.js";
import { comparator } from "../utils/patcher.js";
import { emptyObject } from "../utils/objectutils.js";


export async function commonGetService(table, query) {
  const data = await commonFindAll(table, query)
  return data
}

export async function commonCreateService(table, data) {
  const result = await commonCreate(table, data)
  return result
}

export async function commonUpdateService(table, id, data) {
  const existing = await commonFindById(table, id)
  if (!existing) {
    throw new HttpError(`Record with id ${id} does not exist`, StatusCodes.NOT_FOUND)
  }

  const changes = comparator(existing, data)
  if (emptyObject(changes)) return existing;

  const result = await commonUpdate(table, id, changes)
  return result
}

export async function commonDeleteService(table, id) {
  const existing = await commonFindById(table, id)
  if (!existing) {
    throw new HttpError(`Record with id ${id} does not exist`, StatusCodes.NOT_FOUND)
  }
  const result = await commonDelete(table, id)
  return result
}

export async function commonGetSingleService(table, id) {
  const existing = await commonFindById(table, id)
  if (!existing) {
    throw new HttpError(`Record with id ${id} does not exist`, StatusCodes.NOT_FOUND)
  }
  return existing
}

export async function commonGetSingleServiceBySlug(table, slug) {
  const existing = await commonFindBySlug(table, slug);

  if (!existing) {
    throw new HttpError(
      `Record with slug ${slug} doesn't exist`,
      StatusCodes.NOT_FOUND,
    );
  }
  return existing;
}
