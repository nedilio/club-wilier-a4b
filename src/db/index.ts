import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { join } from "path";

const dbPath = process.env.DATABASE_URL || "./data/wilier.db";
const absolutePath = join(process.cwd(), dbPath.replace("./", ""));

const sqlite = new Database(absolutePath);

sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

export { schema };
