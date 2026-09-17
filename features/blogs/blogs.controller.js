import { StatusCodes } from "http-status-codes";

import { parseBody } from "../../common/utils/parse.js";

import {
  blogIdSchema,
  blogSlugSchema,
  createBlogSchema,
  getBlogsQuerySchema,
  updateBlogSchema,
} from "./blogs.schema.js";

import {
  createBlogService,
  deleteBlogService,
  getBlogBySlugService,
  getBlogByIdService,
  getBlogsService,
  updateBlogService,
} from "./blogs.service.js";

export async function createBlog(req, res) {
  const data = parseBody(createBlogSchema, req.body);

  const blog = await createBlogService(req.user, data);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Blog created successfully",
    data: blog,
  });
}

export async function getBlogs(req, res) {
  const query = parseBody(getBlogsQuerySchema, req.query);

  const result = await getBlogsService(req.user, query);

  res.status(StatusCodes.OK).json({
    success: true,
    items: result.items,
    ...result.pagination,
  });
}

export async function getBlogBySlug(req, res) {
  const { slug } = parseBody(blogSlugSchema, req.params);

  const blog = await getBlogBySlugService(req.user, slug);

  res.status(StatusCodes.OK).json({
    success: true,
    data: blog,
  });
}

export async function getBlogById(req, res) {
  const { id } = parseBody(blogIdSchema, req.params);
  const blog = await getBlogByIdService(req.user, id);
  res.status(StatusCodes.OK).json({ success: true, data: blog });
}

export async function updateBlog(req, res) {
  const { id } = parseBody(blogIdSchema, req.params);

  const data = parseBody(updateBlogSchema, req.body);

  const blog = await updateBlogService(req.user, id, data);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Blog updated successfully",
    data: blog,
  });
}

export async function deleteBlog(req, res) {
  const { id } = parseBody(blogIdSchema, req.params);

  await deleteBlogService(req.user, id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Blog deleted successfully",
  });
}
