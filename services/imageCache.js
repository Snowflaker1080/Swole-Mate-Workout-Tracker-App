import fs    from "fs/promises";
import path  from "path";
import fetch from "node-fetch";
import GymWorkout from "../models/gymWorkout.js";

export async function cacheToDisk(ex) {
  // Skip if already cached, no URL, or a placeholder
  if (
    ex.localImagePath ||
    !ex.image ||
    ex.image === "image_coming_soon" ||
    !/^https?:\/\//.test(ex.image)
  ) {
    return ex;
  }

  try {
    const response = await fetch(ex.image);
    if (!response.ok) {
      console.warn(`[cacheToDisk] ${ex.apiId} returned HTTP ${response.status}`);
      return ex;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const ext         = contentType.split("/")[1];
    const filename    = `${ex.apiId}-${Date.now()}.${ext}`;
    const fullPath    = path.join(process.cwd(), "public/uploads/exercises", filename);
    const buffer      = await response.buffer();

    await fs.writeFile(fullPath, buffer);
    ex.localImagePath = `/uploads/exercises/${filename}`;
    await ex.save();
  } catch (err) {
    console.error(`[cacheToDisk] failed for ${ex.apiId}:`, err.message);
  }

  return ex;
}