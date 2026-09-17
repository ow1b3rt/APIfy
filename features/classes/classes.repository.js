import { db } from "../../config/db.js";
import { classes, registrations } from "#/db/schema/index.js";
import { and, eq } from "drizzle-orm";

export async function findClassById(id) {
  const [classData] = await db.select().from(classes).where(eq(classes.id, id));
  return classData;
}

export async function getClasses() {
  const allClasses = await db.select().from(classes);
  return allClasses;
}

export async function updateClass(data) {
  const { id, ...rest } = data;
  const [updatedClass] = await db
    .update(classes)
    .set(rest)
    .where(eq(classes.id, id))
    .returning();
  return updatedClass;
}

export async function createClass(data) {
  const [createdClass] = await db.insert(classes).values(data).returning();
  return createdClass;
}

export async function deleteClass(id) {
  const [deletedClass] = await db
    .delete(classes)
    .where(eq(classes.id, id))
    .returning();
  return deletedClass;
}

export async function getClassesForStudent(studentId) {
  const result = await db
    .select({
      classId: classes.id,
      className: classes.name,
      startTime: classes.startTime,
      endTime: classes.endTime,
      type: registrations.type,
      remarks: registrations.remarks,
      registeredAt: registrations.createdAt,
    })
    .from(registrations)
    .innerJoin(classes, eq(registrations.classId, classes.id))
    .where(eq(registrations.studentId, studentId));

  return result;
}

export async function getClassesIdForStudent(studentId) {
  const result = await db
    .select({ classId: classes.id })
    .from(registrations)
    .innerJoin(classes, eq(registrations.classId, classes.id))
    .where(eq(registrations.studentId, studentId));

  return result;
}

export async function addClassForStudent(
  studentId,
  classId,
  executor = db,
) {
  const [result] = await executor
    .insert(registrations)
    .values({ studentId, classId })
    .onConflictDoNothing({
      target: [registrations.studentId, registrations.classId],
    })
    .returning();

  return result;
}

export async function removeClassForStudent(studentId, classId) {
  const [result] = await db
    .delete(registrations)
    .where(and(eq(registrations.studentId, studentId), eq(registrations.classId, classId)))
    .returning();

  return result;
}
