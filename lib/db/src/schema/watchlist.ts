import { pgTable, serial, text, integer, jsonb, timestamp, unique } from "drizzle-orm/pg-core";
import { z } from "zod";
import { TitleSnapshotSchema } from "./ratings";

export const watchlistTable = pgTable(
  "watchlist",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    titleId: integer("title_id").notNull(),
    mediaType: text("media_type", { enum: ["movie", "tv"] }).notNull(),
    titleSnapshot: jsonb("title_snapshot").notNull(),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("watchlist_session_title").on(t.sessionId, t.titleId, t.mediaType)],
);

export const insertWatchlistSchema = z.object({
  sessionId: z.string(),
  titleId: z.number().int(),
  mediaType: z.enum(["movie", "tv"]),
  titleSnapshot: TitleSnapshotSchema,
});

export type InsertWatchlistEntry = z.infer<typeof insertWatchlistSchema>;
export type WatchlistEntry = typeof watchlistTable.$inferSelect;
