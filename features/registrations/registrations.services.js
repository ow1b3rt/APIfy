import { StatusCodes } from "http-status-codes";

import HttpError from "../../common/errors/HttpError.js";
import { db } from "../../config/db.js";
import {
  findStudentByEmail,
  insertStudent,
  insertRegistration,
  findClassByNameAndSchedule,
} from "./registrations.repository.js";

export async function submitPublicRegistration(data) {
  const existing = await findStudentByEmail(data.email);
  if (existing) {
    throw new HttpError(
      "This email is already registered. Please contact us if you need to update your details.",
      StatusCodes.CONFLICT,
    );
  }

  const classRecord = await findClassByNameAndSchedule(
    data.class,
    data.start_time,
    data.end_time,
  );

  if (!classRecord) {
    throw new HttpError("The selected class or schedule does not exist", StatusCodes.BAD_REQUEST);
  }

  const { student, registration } = await db.transaction(async (tx) => {
    const createdStudent = await insertStudent({
      name: data.name,
      email: data.email,
      phone: data.phone,
      dob: data.dob ?? null,
      gpa: data.gpa ?? 0,
      location: data.location ?? null,
      qualification: data.qualification ?? null,
    }, tx);

    const createdRegistration = await insertRegistration(
      createdStudent.id,
      classRecord.id,
      data.classType ?? "physical",
      data.additionalInfo ?? null,
      tx,
    );

    return { student: createdStudent, registration: createdRegistration };
  });

  return { student, class: classRecord, registration };
}
