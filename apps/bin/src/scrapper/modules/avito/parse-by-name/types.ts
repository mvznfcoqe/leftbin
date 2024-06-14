import { avitoBin } from "@/scrapper/schema";

export type AvitoItem = Omit<typeof avitoBin.$inferSelect, "id" | "created_at">;
