import { Router } from "express";

import { createRegistrationController } from "./registrations.controller.js";
import { getRegistrationOptionsController } from "./registrations.options.js";

const router = Router();

router.route("/options").get(getRegistrationOptionsController);
router.route("/").post(createRegistrationController);

export default router;
