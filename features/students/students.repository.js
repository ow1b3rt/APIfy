import { eq } from "drizzle-orm";

import { db } from "../../config/db.js";
import { students } from "../../db/schema/index.js";
import { emptyObject } from "#/common/utils/objectutils.js";


export async function findStudentByEmail(email) {
  const [student] = await db.select().from(students).where(eq(students.email, email)).limit(1);
  return student;
}

export async function findStudentById(id) {
  const [student] = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return student;
}

export async function createStudent(data, executor = db) {
  const [student] = await executor
    .insert(students)
    .values(data)
    .returning();

  return student;
}

export async function getStudents() {
  const rows = await db
    .select().from(students);

  return rows;
}

export async function updateStudent(id, changes) {
  if (emptyObject(changes)) return changes;
  const [student] = await db
    .update(students)
    .set(changes)
    .where(eq(students.id, id))
    .returning();

  return student;
}

export async function deleteStudent(id) {
  const [student] = await db
    .delete(students)
    .where(eq(students.id, id))
    .returning()

  return student
}
