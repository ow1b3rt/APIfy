import { Router } from "express";

import { authenticateUser } from "../../common/authentication/auth.js";
import { login, logout, me, refresh } from "./auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticateUser, me);

export default router;
