import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  level: text("level"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const folders = pgTable("folders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: text("color").default("#2563EB"),
  userId: uuid("user_id").references(() => users.id).notNull(),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  folderId: uuid("folder_id").references(() => folders.id),
  isTranslated: boolean("is_translated").default(false),
  translationProgress: integer("translation_progress").default(0),
  studyProgress: integer("study_progress").default(0),
  lastAccessed: timestamp("last_accessed"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const translations = pgTable("translations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: uuid("file_id").references(() => files.id).notNull(),
  pageNumber: integer("page_number").notNull(),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const annotations = pgTable("annotations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: uuid("file_id").references(() => files.id).notNull(),
  pageNumber: integer("page_number").notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  type: text("type").notNull(), // 'highlight', 'note', 'bookmark'
  content: text("content"),
  color: text("color").default("#FBBF24"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const flashcards = pgTable("flashcards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: uuid("file_id").references(() => files.id),
  userId: uuid("user_id").references(() => users.id).notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  difficulty: integer("difficulty").default(1), // 1-5
  nextReview: timestamp("next_review").defaultNow(),
  reviewCount: integer("review_count").default(0),
  correctStreak: integer("correct_streak").default(0),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exams = pgTable("exams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  title: text("title").notNull(),
  examDate: timestamp("exam_date").notNull(),
  location: text("location"),
  description: text("description"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studySessions = pgTable("study_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  fileId: uuid("file_id").references(() => files.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  sessionType: text("session_type").notNull(), // 'reading', 'review', 'translation', 'focus'
  pomodoroCount: integer("pomodoro_count").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userGoals = pgTable("user_goals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  goalType: text("goal_type").notNull(), // 'daily_hours', 'weekly_files', 'monthly_reviews'
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").default(0),
  period: text("period").notNull(), // 'daily', 'weekly', 'monthly'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  points: integer("points").notNull(),
  isEarned: boolean("is_earned").default(false),
  earnedAt: timestamp("earned_at"),
  criteria: jsonb("criteria"), // JSON object describing criteria
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  folders: many(folders),
  files: many(files),
  flashcards: many(flashcards),
  exams: many(exams),
  studySessions: many(studySessions),
  goals: many(userGoals),
  rewards: many(rewards),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  user: one(users, { fields: [folders.userId], references: [users.id] }),
  parent: one(folders, { fields: [folders.parentId], references: [folders.id] }),
  children: many(folders),
  files: many(files),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  user: one(users, { fields: [files.userId], references: [users.id] }),
  folder: one(folders, { fields: [files.folderId], references: [folders.id] }),
  translations: many(translations),
  annotations: many(annotations),
  flashcards: many(flashcards),
  studySessions: many(studySessions),
}));

export const translationsRelations = relations(translations, ({ one }) => ({
  file: one(files, { fields: [translations.fileId], references: [files.id] }),
}));

export const annotationsRelations = relations(annotations, ({ one }) => ({
  file: one(files, { fields: [annotations.fileId], references: [files.id] }),
}));

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  user: one(users, { fields: [flashcards.userId], references: [users.id] }),
  file: one(files, { fields: [flashcards.fileId], references: [files.id] }),
}));

export const examsRelations = relations(exams, ({ one }) => ({
  user: one(users, { fields: [exams.userId], references: [users.id] }),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  user: one(users, { fields: [studySessions.userId], references: [users.id] }),
  file: one(files, { fields: [studySessions.fileId], references: [files.id] }),
}));

export const userGoalsRelations = relations(userGoals, ({ one }) => ({
  user: one(users, { fields: [userGoals.userId], references: [users.id] }),
}));

export const rewardsRelations = relations(rewards, ({ one }) => ({
  user: one(users, { fields: [rewards.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertFolderSchema = createInsertSchema(folders).omit({ id: true, createdAt: true });
export const insertFileSchema = createInsertSchema(files).omit({ id: true, createdAt: true, lastAccessed: true });
export const insertTranslationSchema = createInsertSchema(translations).omit({ id: true, createdAt: true });
export const insertAnnotationSchema = createInsertSchema(annotations).omit({ id: true, createdAt: true });
export const insertFlashcardSchema = createInsertSchema(flashcards).omit({ id: true, createdAt: true, nextReview: true });
export const insertExamSchema = createInsertSchema(exams).omit({ id: true, createdAt: true, reminderSent: true });
export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ id: true, createdAt: true });
export const insertUserGoalSchema = createInsertSchema(userGoals).omit({ id: true, createdAt: true, startDate: true });
export const insertRewardSchema = createInsertSchema(rewards).omit({ id: true, createdAt: true, isEarned: true, earnedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Annotation = typeof annotations.$inferSelect;
export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;
export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Exam = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type UserGoal = typeof userGoals.$inferSelect;
export type InsertUserGoal = z.infer<typeof insertUserGoalSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
