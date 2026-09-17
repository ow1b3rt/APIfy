import { StatusCodes } from "http-status-codes";

import { parseBody } from "../../common/utils/parse.js";
import { submitRegistrationSchema } from "./registrations.schema.js";
import { submitPublicRegistration } from "./registrations.services.js";

export async function createRegistrationController(req, res) {
  const data = parseBody(submitRegistrationSchema, req.body);
  const result = await submitPublicRegistration(data);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Registration successful! We will contact you shortly.",
    student: result.student,
    class: result.class,
    registration: result.registration,
  });
}
