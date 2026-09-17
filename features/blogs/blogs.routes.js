import { Router } from "express";

import {
    authenticateUser,
    optionalAuthenticateUser,
} from "../../common/authentication/auth.js";
import {
    createBlog,
    deleteBlog,
    getBlogBySlug,
    getBlogs,
    getBlogById,
    updateBlog,
} from "./blogs.controller.js";

const router = Router();

router
    .route("/")
    .get(optionalAuthenticateUser, getBlogs)
    .post(authenticateUser, createBlog);

router
    .route("/:id")
    .patch(authenticateUser, updateBlog)
    .delete(authenticateUser, deleteBlog)
    .get(optionalAuthenticateUser, getBlogById);

router.get("/slug/:slug", optionalAuthenticateUser, getBlogBySlug);

export default router;
