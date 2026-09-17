import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";

const LAYOUTS_DIR = path.join(process.cwd(), "frontlayouts");

function getLayoutPath(name) {
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(name)) {
    const error = new Error("Invalid layout name");
    error.statusCode = StatusCodes.BAD_REQUEST;
    throw error;
  }
  return path.join(LAYOUTS_DIR, `${name}.json`);
}

export async function saveLayoutController(req, res) {
  const { name } = req.params;
  const data = req.body;

  await fs.mkdir(LAYOUTS_DIR, { recursive: true });
  const filePath = getLayoutPath(name);

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Layout '${name}' saved`,
  });
}

export async function getLayoutController(req, res) {
  const { name } = req.params;
  const filePath = getLayoutPath(name);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    res.status(StatusCodes.OK).json({
      success: true,
      layout: JSON.parse(content),
    });
  } catch (err) {
    if (err.statusCode) throw err;
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: `Layout '${name}' not found`,
    });
  }
}
