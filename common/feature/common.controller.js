import {
  commonGetService,
  commonCreateService,
  commonUpdateService,
  commonDeleteService,
  commonGetSingleService,
  commonGetSingleServiceBySlug,
} from "./common.services.js";
import { StatusCodes } from "http-status-codes";
import { getTableName } from "drizzle-orm";
import { parseBody } from "#/common/utils/parse.js";
import { buildWhereFromQuery } from "#/common/utils/queryhelper.js";

function getResourceName(source) {
  return source?.name ?? getTableName(source);
}

export async function commonGetController(
  req,
  res,
  table,
  searchFields = [],
  orderBy = undefined,
  filters = [],
) {
  const query = {
    search: req.query.search,
    page: req.query.page,
    pageSize: req.query.pageSize,
    searchFields: searchFields,
    orderBy: orderBy,
    where: buildWhereFromQuery(table, req.query, filters),
  };
  const data = await commonGetService(table, query);

  res.status(StatusCodes.CREATED).json({
    success: true,
    resource: getResourceName(table),
    ...data,
  });
}

export async function commonCreateController(req, res, table, schema) {
  const data = parseBody(schema, req.body);
  const result = await commonCreateService(table, data);

  res.status(StatusCodes.OK).json({
    success: true,
    [getResourceName(table)]: result,
  });
}

export async function commonUpdateController(req, res, table, schema) {
  const data = parseBody(schema, req.body);
  const result = await commonUpdateService(table, req.params.id, data);
  res.status(StatusCodes.OK).json({
    success: true,
    [getResourceName(table)]: result,
  });
}

export async function commonDeleteController(req, res, table) {
  const data = await commonDeleteService(table, req.params.id);
  res.status(StatusCodes.OK).json({
    success: true,
    [getResourceName(table)]: data,
  });
}

export async function commonGetSingleController(req, res, table) {
  const data = await commonGetSingleService(table, req.params.id);
  res.status(StatusCodes.OK).json({
    success: true,
    resource: getResourceName(table),
    item: data,
  });
}

export async function commonGetSingleBySlugController(req, res, table) {
  const data = await commonGetSingleServiceBySlug(table, req.params.slug);
  res.status(StatusCodes.OK).json({
    success: true,
    resource: getResourceName(table),
    item: data,
  });
}
