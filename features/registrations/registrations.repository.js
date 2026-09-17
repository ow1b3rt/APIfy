import { eq, and } from "drizzle-orm";

import { db } from "../../config/db.js";
import { students, registrations, classes } from "#/db/schema/index.js";

export async function findStudentByEmail(email) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.email, email))
    .limit(1);
  return student;
}

export async function insertStudent(data, executor = db) {
  const [student] = await executor.insert(students).values(data).returning();
  return student;
}

export async function findClassByNameAndSchedule(name, startTime, endTime) {
  const [classRow] = await db
    .select()
    .from(classes)
    .where(
      and(
        eq(classes.name, name),
        eq(classes.startTime, startTime),
        eq(classes.endTime, endTime),
      ),
    )
    .limit(1);
  return classRow;
}

export async function insertRegistration(studentId, classId, type, remarks, executor = db) {
  const [registration] = await executor
    .insert(registrations)
    .values({ studentId, classId, type, remarks })
    .onConflictDoNothing({
      target: [registrations.studentId, registrations.classId],
    })
    .returning();
  return registration;
}
