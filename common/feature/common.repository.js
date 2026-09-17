import { db } from "../../config/db.js"
import { eq } from "drizzle-orm"
import { fromTable, paginateAndSearch } from "../utils/queryhelper.js"

export async function commonCreate(table, data) {
  const [result] = await db.insert(table).values(data).returning()

  return result
}

// Fetches a single row by id — pass a Table, or a join() result directly
export async function commonFindById(source, id) {
  const baseTable = source && source.dataQuery ? source.baseTable : source;
  const { dataQuery } = source && source.dataQuery ? source : fromTable(source);
  let [result] = await dataQuery.where(eq(baseTable.id, id));

  if (result?.password) {
    let { password, ...rest } = result
    result = rest
  }
  return result;
}

export async function commonFindBySlug(source, slug) {
  const baseTable = source && source.dataQuery ? source.baseTable : source;
  const { dataQuery } = source && source.dataQuery ? source : fromTable(source);
  let [result] = await dataQuery.where(eq(baseTable.slug, slug));

  if (result?.password) {
    let { password, ...rest } = result;
    result = rest;
  }
  return result;
}


export async function commonFindAll(table, query = {}) {

  const result = await paginateAndSearch(table, {
    query: query.search,
    searchFields: query.searchFields,
    page: query.page,
    pageSize: query.pageSize,
    orderBy: query.orderBy,
    where: query.where,
  })
  return result
}

export async function commonUpdate(table, id, data) {
  const values = table.updatedAt ? { ...data, updatedAt: new Date() } : data;
  const [result] = await db.update(table).set(values).where(eq(table.id, id)).returning()
  return result
}

export async function commonDelete(table, id) {
  const [result] = await db.delete(table).where(eq(table.id, id)).returning()
  return result
}
