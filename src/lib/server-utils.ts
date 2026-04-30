import { readFileSync } from "node:fs";
import path from "node:path";

export function getImageBuffer(filename: string): Buffer {
  const filePath = path.join(process.cwd(), "public", filename);
  return readFileSync(filePath);
}
