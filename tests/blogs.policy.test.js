import assert from "node:assert/strict";
import test from "node:test";

import {
  canCreateBlog,
  canDeleteBlog,
  canManageAnyBlog,
  canUpdateBlog,
  canViewBlog,
} from "../features/blogs/blogs.policy.js";

const published = { status: "published", authorId: "author-1" };
const draft = { status: "draft", authorId: "author-1" };

test("published blogs are public but drafts are not", () => {
  assert.equal(canViewBlog(null, published), true);
  assert.equal(canViewBlog(null, draft), false);
});

test("authors can only manage their own drafts", () => {
  const user = { role: "author" };
  assert.equal(canViewBlog(user, draft, "author-1"), true);
  assert.equal(canViewBlog(user, draft, "author-2"), false);
  assert.equal(canUpdateBlog(user, draft, "author-1"), true);
  assert.equal(canDeleteBlog(user, draft, "author-2"), false);
});

test("admin and editor can manage all blogs", () => {
  assert.equal(canManageAnyBlog({ role: "admin" }), true);
  assert.equal(canManageAnyBlog({ role: "editor" }), true);
  assert.equal(canUpdateBlog({ role: "editor" }, draft), true);
});

test("only authors and admins can create blogs", () => {
  assert.equal(canCreateBlog({ role: "author" }), true);
  assert.equal(canCreateBlog({ role: "admin" }), true);
  assert.equal(canCreateBlog({ role: "editor" }), false);
});
