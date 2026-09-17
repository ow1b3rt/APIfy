import { StatusCodes } from "http-status-codes";

import HttpError from "../../common/errors/HttpError.js";

import {
    blogSlugExists,
    deleteBlogById,
    findAllBlogs,
    findBlogById,
    findBlogBySlug,
    findDraftBlogsByAuthor,
    findPublishedAndDraftsByAuthor,
    findPublishedBlogBySlug,
    findPublishedBlogs,
    insertBlog,
    updateBlogById,
    findAuthorByUserId,
} from "./blogs.repository.js";

import {
    canCreateBlog,
    canDeleteBlog,
    canManageAnyBlog,
    canUpdateBlog,
    canViewBlog,
} from "./blogs.policy.js";

import { createSlug } from "./blogs.utils.js";

async function requireAuthorProfile(userId) {
    const author = await findAuthorByUserId(userId);

    if (!author) {
        throw new HttpError("Author profile not found", StatusCodes.FORBIDDEN);
    }

    return author;
}

async function generateUniqueSlug(title) {
    const baseSlug = createSlug(title);

    if (!(await blogSlugExists(baseSlug))) {
        return baseSlug;
    }

    let suffix = 2;

    while (suffix <= 20) {
        const candidate = `${baseSlug}-${suffix}`;

        const exists = await blogSlugExists(candidate);

        if (!exists) {
            return candidate;
        }

        suffix++;
    }

    return `${baseSlug}-${Date.now()}`;
}

function buildPagination(page, limit, total) {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}

function formatListResult(result, query) {
    return {
        items: result.items,

        pagination: buildPagination(query.page, query.limit, result.total),
    };
}

export async function createBlogService(user, data) {
    if (!canCreateBlog(user)) {
        throw new HttpError(
            "You are not allowed to create blogs",
            StatusCodes.FORBIDDEN,
        );
    }

    const author = await requireAuthorProfile(user.id);

    const slug = await generateUniqueSlug(data.title);

    const blog = await insertBlog({
        ...data,

        slug,

        authorId: author.id,

        publishedAt: data.status === "published" ? new Date() : null,
    });

    return blog;
}

export async function getBlogsService(user, query) {
    const options = {
        search: query.search,

        page: query.page,

        limit: query.limit,

        sortBy: query.sortBy,

        order: query.order,
    };

    if (!user) {
        const result = await findPublishedBlogs(options);

        return formatListResult(result, query);
    }

    if (canManageAnyBlog(user)) {
        const result = await findAllBlogs({
            ...options,

            status: query.status,
        });

        return formatListResult(result, query);
    }

    if (user.role === "author") {
        const author = await requireAuthorProfile(user.id);

        if (query.status === "draft") {
            const result = await findDraftBlogsByAuthor(author.id, options);

            return formatListResult(result, query);
        }

        if (query.status === "published") {
            const result = await findPublishedBlogs(options);

            return formatListResult(result, query);
        }

        const result = await findPublishedAndDraftsByAuthor(author.id, options);

        return formatListResult(result, query);
    }

    const result = await findPublishedBlogs(options);

    return formatListResult(result, query);
}

export async function getBlogBySlugService(user, slug) {
    if (!user) {
        const blog = await findPublishedBlogBySlug(slug);

        if (!blog) {
            throw new HttpError("Blog not found", StatusCodes.NOT_FOUND);
        }

        return blog;
    }

    const blog = await findBlogBySlug(slug);

    if (!blog) {
        throw new HttpError("Blog not found", StatusCodes.NOT_FOUND);
    }

    const author = await findAuthorByUserId(user.id);

    if (!canViewBlog(user, blog, author?.id)) {
        throw new HttpError("Blog not found", StatusCodes.NOT_FOUND);
    }

    return blog;
}

export async function getBlogByIdService(user, id) {
    const blog = await findBlogById(id);
    if (!blog) throw new HttpError("Blog not found", StatusCodes.NOT_FOUND);

    const author = user?.role === "author"
        ? await findAuthorByUserId(user.id)
        : null;

    if (!canViewBlog(user, blog, author?.id)) {
        throw new HttpError("Blog not found", StatusCodes.NOT_FOUND);
    }

    return blog;
}

export async function updateBlogService(user, id, data) {
    const existingBlog = await findBlogById(id);

    if (!existingBlog) {
        throw new HttpError("Blog not found", StatusCodes.NOT_FOUND);
    }

    let author = null;

    if (user.role === "author") {
        author = await requireAuthorProfile(user.id);
    }

    if (!canUpdateBlog(user, existingBlog, author?.id)) {
        throw new HttpError(
            "You are not allowed to update this blog",
            StatusCodes.FORBIDDEN,
        );
    }

    const updateData = {
        ...data,
    };

    if (data.title && data.title !== existingBlog.title) {
        updateData.slug = await generateUniqueSlug(data.title);
    }

    if (data.status === "published" && existingBlog.status !== "published") {
        updateData.publishedAt = new Date();
    }

    if (data.status === "draft" && existingBlog.status === "published") {
        updateData.publishedAt = null;
    }

    const blog = await updateBlogById(id, updateData);

    return blog;
}

export async function deleteBlogService(user, id) {
    const blog = await findBlogById(id);

    if (!blog) {
        throw new HttpError("Blog not found", StatusCodes.NOT_FOUND);
    }

    let author = null;

    if (user.role === "admin") {
      await deleteBlogById(id);
      return
    }

    if (user.role === "author") {
        author = await requireAuthorProfile(user.id);
    }


    if (!canDeleteBlog(user, blog, author?.id)) {
        throw new HttpError(
            "You are not allowed to delete this blog",
            StatusCodes.FORBIDDEN,
        );
    }

    await deleteBlogById(id);
}
