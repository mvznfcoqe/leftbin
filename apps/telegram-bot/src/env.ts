import dotnev from "dotenv";

dotnev.config();

export const env = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  MIGRATE: Boolean(Number(process.env.MIGRATE)) || false,
};
