export function canCreateBlog(user) {
  return ["author", "admin"].includes(user?.role);
}

export function canManageAnyBlog(user) {
  return ["admin", "editor"].includes(user?.role);
}

export function canViewBlog(user, blog, authorId = null) {
  if (!blog) {
    return false;
  }

  if (blog.status === "published") {
    return true;
  }

  if (!user) {
    return false;
  }

  if (canManageAnyBlog(user)) {
    return true;
  }

  if (user.role === "author") {
    return blog.authorId === authorId;
  }

  return false;
}

export function canUpdateBlog(user, blog, authorId = null) {
  if (!user || !blog) {
    return false;
  }

  if (canManageAnyBlog(user)) {
    return true;
  }

  if (user.role === "author") {
    return blog.authorId === authorId;
  }

  return false;
}

export function canDeleteBlog(user, blog, authorId = null) {
  return canUpdateBlog(user, blog, authorId);
}
