import { pgTable, serial, text, integer, jsonb, timestamp, unique } from "drizzle-orm/pg-core";
import { z } from "zod";

export const TitleSnapshotSchema = z.object({
  title: z.string(),
  posterPath: z.string().nullable(),
  backdropPath: z.string().nullable(),
  year: z.string().nullable(),
  voteAverage: z.number(),
  mediaType: z.enum(["movie", "tv"]),
});
export type TitleSnapshot = z.infer<typeof TitleSnapshotSchema>;

export const ratingsTable = pgTable(
  "ratings",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    titleId: integer("title_id").notNull(),
    mediaType: text("media_type", { enum: ["movie", "tv"] }).notNull(),
    rating: integer("rating").notNull(), // 1–10
    titleSnapshot: jsonb("title_snapshot").notNull(),
    ratedAt: timestamp("rated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("ratings_session_title").on(t.sessionId, t.titleId, t.mediaType)],
);

export const insertRatingSchema = z.object({
  sessionId: z.string(),
  titleId: z.number().int(),
  mediaType: z.enum(["movie", "tv"]),
  rating: z.number().int().min(1).max(10),
  titleSnapshot: TitleSnapshotSchema,
});

export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratingsTable.$inferSelect;
