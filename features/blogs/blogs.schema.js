import { z } from "zod";

export const createBlogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title cannot exceed 255 characters"),

  content: z
    .string()
    .default(""),

  thumbnail: z
    .uuid("Invalid thumbnail ID")
    .nullable()
    .optional(),

  status: z
    .enum(["draft", "published"])
    .default("draft"),

  metaTitle: z
    .string()
    .trim()
    .max(255, "Meta title cannot exceed 255 characters")
    .nullable()
    .optional(),

  metaDescription: z
    .string()
    .trim()
    .max(300, "Meta description cannot exceed 300 characters")
    .nullable()
    .optional(),

  canonicalUrl: z
    .url("Invalid canonical URL")
    .max(500, "Canonical URL cannot exceed 500 characters")
    .nullable()
    .optional(),

  ogTitle: z
    .string()
    .trim()
    .max(255, "OG title cannot exceed 255 characters")
    .nullable()
    .optional(),

  ogDescription: z
    .string()
    .trim()
    .max(300, "OG description cannot exceed 300 characters")
    .nullable()
    .optional(),

  schema: z
    .string()
    .nullable()
    .optional(),

  redirectUrl: z
    .url("Invalid redirect URL")
    .nullable()
    .optional(),
});


export const updateBlogSchema = createBlogSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required",
    }
  );


export const blogIdSchema = z.object({
  id: z.uuid("Invalid blog ID"),
});


export const blogSlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(255, "Slug cannot exceed 255 characters"),
});


export const getBlogsQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  search: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional(),

  status: z
    .enum(["draft", "published"])
    .optional(),

  sortBy: z
    .enum([
      "createdAt",
      "publishedAt",
      "viewCount",
      "title",
    ])
    .default("createdAt"),

  order: z
    .enum(["asc", "desc"])
    .default("desc"),
});