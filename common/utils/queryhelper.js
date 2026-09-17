import { sql, ilike, or, and } from "drizzle-orm";
import { eq, getTableColumns } from "drizzle-orm";
import { db } from "../../config/db.js";

const JOIN_METHODS = {
  inner: "innerJoin",
  left: "leftJoin",
  right: "rightJoin",
  full: "fullJoin",
};

// Builds a base data/count query pair from a single table
export function fromTable(table) {
  return {
    dataQuery: db.select().from(table),
    countQuery: db.select({ count: sql`count(*)::int` }).from(table),
  };
}

// Builds a base data/count query pair from a join — pass this into paginateAndSearch
export function join(
  baseTable,
  joinTable,
  { on, fields, type = "inner", name } = {},
) {
  const method = JOIN_METHODS[type];
  if (!method) throw new Error(`Unknown join type: ${type}`);

  const columns = fields ?? {
    ...getTableColumns(baseTable),
    ...getTableColumns(joinTable),
  };

  const dataQuery = (fields ? db.select(fields) : db.select())
    .from(baseTable)
    [method](joinTable, on);

  const countQuery = db
    .select({ count: sql`count(*)::int` })
    .from(baseTable)
    [method](joinTable, on);

  return { dataQuery, countQuery, columns, name, baseTable };
}

export async function paginateAndSearch(
  source, // a Table, OR the { dataQuery, countQuery } object returned by join()
  {
    query = "",
    searchFields = [],
    where,
    orderBy,
    page = 1,
    pageSize,
  } = {},
) {
  const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const hasPageSize = pageSize !== undefined && pageSize !== null && pageSize !== "";
  const parsedPageSize = hasPageSize
    ? Math.min(100, Math.max(1, Number.parseInt(pageSize, 10) || 20))
    : null;

  const { dataQuery: baseData, countQuery: baseCount } =
    source && source.dataQuery ? source : fromTable(source);

  const searchCondition =
    query.trim() !== "" && searchFields.length > 0
      ? or(...searchFields.map((field) => ilike(field, `%${query}%`)))
      : undefined;

  const conditions = [searchCondition, where].filter(Boolean);
  const finalWhere = conditions.length > 0 ? and(...conditions) : undefined;

  let dataQuery = baseData;
  let countQuery = baseCount;

  if (finalWhere) {
    dataQuery = dataQuery.where(finalWhere);
    countQuery = countQuery.where(finalWhere);
  }
  if (orderBy) dataQuery = dataQuery.orderBy(orderBy);

  if (parsedPageSize !== null) {
    dataQuery = dataQuery
      .limit(parsedPageSize)
      .offset((parsedPage - 1) * parsedPageSize);
  }

  const [items, countResult] = await Promise.all([
    dataQuery,
    countQuery,
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  return {
    items,
    total,
    page: parsedPageSize === null ? 1 : parsedPage,
    pageSize: parsedPageSize ?? total,
    totalPages: parsedPageSize === null ? (total > 0 ? 1 : 0) : Math.ceil(total / parsedPageSize),
  };
}

export function buildWhereFromQuery(
  table,
  queryParams = {},
  allowedFields = [],
) {
  if (allowedFields.length === 0) return undefined;
  const columns = table.columns ?? getTableColumns(table);
  const conditions = [];

  for (const key of allowedFields) {
    if (!(key in columns)) continue; // guard against typos in allowedFields itself

    const value = queryParams[key];
    if (value === undefined || value === null || value === "") continue;

    const column = columns[key];
    conditions.push(eq(column, coerceValue(value, column)));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function coerceValue(value, column) {
  const dataType = column.dataType;

  if (dataType === "number" && !isNaN(value)) return Number(value);
  if (dataType === "boolean") return value === "true" || value === true;
  if (dataType === "date") return new Date(value);

  return value;
}

export function joinMany(baseTable, joins, { fields, name } = {}) {
  let dataQuery = fields
    ? db.select(fields).from(baseTable)
    : db.select().from(baseTable);

  let countQuery = db.select({ count: sql`count(*)::int` }).from(baseTable);

  for (const { table, on, type = "inner" } of joins) {
    const method = JOIN_METHODS[type];

    if (!method) {
      throw new Error(`Unknown join type: ${type}`);
    }

    dataQuery = dataQuery[method](table, on);
    countQuery = countQuery[method](table, on);
  }

  return {
    dataQuery,
    countQuery,
    columns: fields ?? getTableColumns(baseTable),
    name,
    baseTable,
  };
}
