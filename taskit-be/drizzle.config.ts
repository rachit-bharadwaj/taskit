import { defineConfig } from "drizzle-kit";

const database_url = process.env.DATABASE_URL;

if (!database_url) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: database_url,
  },
});
