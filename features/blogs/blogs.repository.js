import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
} from "drizzle-orm";

import { db } from "../../config/db.js";
import {
  authors,
  blogs,
  users,
  media,
} from "../../db/schema/index.js";

const blogListSelection = {
  id: blogs.id,
  title: blogs.title,
  slug: blogs.slug,
  content: blogs.content,
  thumbnail: blogs.thumbnail,
  thumbnailUrl: media.url,
  status: blogs.status,
  viewCount: blogs.viewCount,
  publishedAt: blogs.publishedAt,
  createdAt: blogs.createdAt,
  updatedAt: blogs.updatedAt,

  author: {
    id: authors.id,
    userId: authors.userId,
    name: users.name,
  },
};

export const blogDetailSelection = {
  id: blogs.id,
  title: blogs.title,
  slug: blogs.slug,
  content: blogs.content,
  thumbnail: blogs.thumbnail,
  thumbnailUrl: media.url,
  status: blogs.status,
  viewCount: blogs.viewCount,
  publishedAt: blogs.publishedAt,
  createdAt: blogs.createdAt,
  updatedAt: blogs.updatedAt,

  metaTitle: blogs.metaTitle,
  metaDescription: blogs.metaDescription,
  canonicalUrl: blogs.canonicalUrl,
  ogTitle: blogs.ogTitle,
  ogDescription: blogs.ogDescription,
  schema: blogs.schema,
  redirectUrl: blogs.redirectUrl,

  authorId: authors.id,
  authorUserId: authors.userId,
  authorName: users.name,
};

export async function findAuthorByUserId(userId) {
  const [author] = await db
    .select()
    .from(authors)
    .where(eq(authors.userId, userId))
    .limit(1);

  return author ?? null;
}

function getSearchCondition(search) {
  if (!search) {
    return undefined;
  }

  const value = `%${search}%`;

  return or(
    ilike(blogs.title, value),
    ilike(blogs.content, value),
    ilike(blogs.metaTitle, value),
    ilike(blogs.metaDescription, value),
    ilike(users.name, value)
  );
}

function getOrderCondition(sortBy, order) {
  const sortableColumns = {
    createdAt: blogs.createdAt,
    publishedAt: blogs.publishedAt,
    viewCount: blogs.viewCount,
    title: blogs.title,
  };

  const column =
    sortableColumns[sortBy] ?? blogs.createdAt;

  return order === "asc"
    ? asc(column)
    : desc(column);
}

function combineConditions(...conditions) {
  const validConditions =
    conditions.filter(Boolean);

  if (validConditions.length === 0) {
    return undefined;
  }

  if (validConditions.length === 1) {
    return validConditions[0];
  }

  return and(...validConditions);
}

async function queryBlogs({
  scopeCondition,
  search,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  order = "desc",
}) {
  const offset = (page - 1) * limit;

  const whereCondition =
    combineConditions(
      scopeCondition,
      getSearchCondition(search)
    );

  const [items, totalResult] =
    await Promise.all([
      db
        .select(blogListSelection)
        .from(blogs)
        .innerJoin(
          authors,
          eq(blogs.authorId, authors.id)
        )
        .innerJoin(
          users,
          eq(authors.userId, users.id)
        )
        .leftJoin(
          media,
          eq(blogs.thumbnail, media.id)
        )
        .where(whereCondition)
        .orderBy(
          getOrderCondition(
            sortBy,
            order
          )
        )
        .limit(limit)
        .offset(offset),

      db
        .select({
          total: count(),
        })
        .from(blogs)
        .innerJoin(
          authors,
          eq(blogs.authorId, authors.id)
        )
        .innerJoin(
          users,
          eq(authors.userId, users.id)
        )
        .leftJoin(
          media,
          eq(blogs.thumbnail, media.id)
        )
        .where(whereCondition),
    ]);

  return {
    items,
    total: Number(
      totalResult[0]?.total ?? 0
    ),
  };
}

export async function insertBlog(data) {

  const [blog] = await db
    .insert(blogs)
    .values(data)
    .returning();

  return blog;
}

export async function findBlogById(id) {
  const [blog] = await db
    .select(blogDetailSelection)
    .from(blogs)
    .innerJoin(
      authors,
      eq(blogs.authorId, authors.id)
    )
    .innerJoin(
      users,
      eq(authors.userId, users.id)
    )
    .leftJoin(
      media,
      eq(blogs.thumbnail, media.id)
    )
    .where(eq(blogs.id, id))
    .limit(1);

  return blog ?? null;
}

export async function findBlogBySlug(slug) {
  const [blog] = await db
    .select(blogDetailSelection)
    .from(blogs)
    .innerJoin(
      authors,
      eq(blogs.authorId, authors.id)
    )
    .innerJoin(
      users,
      eq(authors.userId, users.id)
    )
    .leftJoin(
      media,
      eq(blogs.thumbnail, media.id)
    )
    .where(eq(blogs.slug, slug))
    .limit(1);

  return blog ?? null;
}

export async function findPublishedBlogBySlug(
  slug
) {
  const [blog] = await db
    .select(blogDetailSelection)
    .from(blogs)
    .innerJoin(
      authors,
      eq(blogs.authorId, authors.id)
    )
    .innerJoin(
      users,
      eq(authors.userId, users.id)
    )
    .leftJoin(
      media,
      eq(blogs.thumbnail, media.id)
    )
    .where(
      and(
        eq(blogs.slug, slug),
        eq(blogs.status, "published")
      )
    )
    .limit(1);

  return blog ?? null;
}

export async function findPublishedBlogs(
  options
) {
  return queryBlogs({
    ...options,
    scopeCondition: eq(
      blogs.status,
      "published"
    ),
  });
}

export async function findAllBlogs({
  status,
  ...options
}) {
  return queryBlogs({
    ...options,
    scopeCondition: status
      ? eq(blogs.status, status)
      : undefined,
  });
}

export async function findDraftBlogsByAuthor(
  authorId,
  options
) {
  return queryBlogs({
    ...options,
    scopeCondition: and(
      eq(blogs.status, "draft"),
      eq(blogs.authorId, authorId)
    ),
  });
}

export async function findPublishedAndDraftsByAuthor(
  authorId,
  options
) {
  return queryBlogs({
    ...options,
    scopeCondition: or(
      eq(
        blogs.status,
        "published"
      ),
      and(
        eq(
          blogs.status,
          "draft"
        ),
        eq(
          blogs.authorId,
          authorId
        )
      )
    ),
  });
}

export async function updateBlogById(
  id,
  data
) {
  const [blog] = await db
    .update(blogs)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(blogs.id, id))
    .returning();

  return blog ?? null;
}

export async function deleteBlogById(id) {
  const [blog] = await db
    .delete(blogs)
    .where(eq(blogs.id, id))
    .returning({
      id: blogs.id,
    });

  return blog ?? null;
}

export async function blogSlugExists(slug) {
  const [blog] = await db
    .select({
      id: blogs.id,
    })
    .from(blogs)
    .where(eq(blogs.slug, slug))
    .limit(1);

  return Boolean(blog);
}
