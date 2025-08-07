import { 
  users, folders, files, translations, annotations, flashcards, 
  exams, studySessions, userGoals, rewards,
  type User, type InsertUser, type Folder, type InsertFolder,
  type File, type InsertFile, type Translation, type InsertTranslation,
  type Annotation, type InsertAnnotation, type Flashcard, type InsertFlashcard,
  type Exam, type InsertExam, type StudySession, type InsertStudySession,
  type UserGoal, type InsertUserGoal, type Reward, type InsertReward
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, gte, lte, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

type SessionStore = session.SessionStore;
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Folder operations
  getFoldersByUser(userId: string): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  deleteFolder(id: string): Promise<void>;
  
  // File operations
  getFilesByUser(userId: string): Promise<File[]>;
  getFilesByFolder(folderId: string): Promise<File[]>;
  getFile(id: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, updates: Partial<File>): Promise<File>;
  deleteFile(id: string): Promise<void>;
  getRecentFiles(userId: string, limit: number): Promise<File[]>;
  
  // Translation operations
  getTranslationsByFile(fileId: string): Promise<Translation[]>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  
  // Annotation operations
  getAnnotationsByFile(fileId: string): Promise<Annotation[]>;
  createAnnotation(annotation: InsertAnnotation): Promise<Annotation>;
  updateAnnotation(id: string, updates: Partial<Annotation>): Promise<Annotation>;
  deleteAnnotation(id: string): Promise<void>;
  
  // Flashcard operations
  getFlashcardsByUser(userId: string): Promise<Flashcard[]>;
  getFlashcardsDueForReview(userId: string): Promise<Flashcard[]>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: string, updates: Partial<Flashcard>): Promise<Flashcard>;
  
  // Exam operations
  getExamsByUser(userId: string): Promise<Exam[]>;
  getUpcomingExams(userId: string): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: string, updates: Partial<Exam>): Promise<Exam>;
  deleteExam(id: string): Promise<void>;
  
  // Study session operations
  getStudySessionsByUser(userId: string): Promise<StudySession[]>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: string, updates: Partial<StudySession>): Promise<StudySession>;
  getTodayStudyTime(userId: string): Promise<number>;
  
  // Goals and rewards
  getUserGoals(userId: string): Promise<UserGoal[]>;
  createUserGoal(goal: InsertUserGoal): Promise<UserGoal>;
  updateUserGoal(id: string, updates: Partial<UserGoal>): Promise<UserGoal>;
  
  getUserRewards(userId: string): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: string, updates: Partial<Reward>): Promise<Reward>;
  
  // Session store
  sessionStore: SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getFoldersByUser(userId: string): Promise<Folder[]> {
    return await db.select().from(folders).where(eq(folders.userId, userId)).orderBy(asc(folders.name));
  }

  async createFolder(folder: InsertFolder): Promise<Folder> {
    const [newFolder] = await db.insert(folders).values(folder).returning();
    return newFolder;
  }

  async deleteFolder(id: string): Promise<void> {
    await db.delete(folders).where(eq(folders.id, id));
  }

  async getFilesByUser(userId: string): Promise<File[]> {
    return await db.select().from(files).where(eq(files.userId, userId)).orderBy(desc(files.createdAt));
  }

  async getFilesByFolder(folderId: string): Promise<File[]> {
    return await db.select().from(files).where(eq(files.folderId, folderId)).orderBy(desc(files.createdAt));
  }

  async getFile(id: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async updateFile(id: string, updates: Partial<File>): Promise<File> {
    const [updatedFile] = await db.update(files).set(updates).where(eq(files.id, id)).returning();
    return updatedFile;
  }

  async deleteFile(id: string): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  async getRecentFiles(userId: string, limit: number): Promise<File[]> {
    return await db.select().from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.lastAccessed))
      .limit(limit);
  }

  async getTranslationsByFile(fileId: string): Promise<Translation[]> {
    return await db.select().from(translations)
      .where(eq(translations.fileId, fileId))
      .orderBy(asc(translations.pageNumber));
  }

  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    const [newTranslation] = await db.insert(translations).values(translation).returning();
    return newTranslation;
  }

  async getAnnotationsByFile(fileId: string): Promise<Annotation[]> {
    return await db.select().from(annotations)
      .where(eq(annotations.fileId, fileId))
      .orderBy(asc(annotations.pageNumber));
  }

  async createAnnotation(annotation: InsertAnnotation): Promise<Annotation> {
    const [newAnnotation] = await db.insert(annotations).values(annotation).returning();
    return newAnnotation;
  }

  async updateAnnotation(id: string, updates: Partial<Annotation>): Promise<Annotation> {
    const [updatedAnnotation] = await db.update(annotations).set(updates).where(eq(annotations.id, id)).returning();
    return updatedAnnotation;
  }

  async deleteAnnotation(id: string): Promise<void> {
    await db.delete(annotations).where(eq(annotations.id, id));
  }

  async getFlashcardsByUser(userId: string): Promise<Flashcard[]> {
    return await db.select().from(flashcards).where(eq(flashcards.userId, userId)).orderBy(desc(flashcards.createdAt));
  }

  async getFlashcardsDueForReview(userId: string): Promise<Flashcard[]> {
    const now = new Date();
    return await db.select().from(flashcards)
      .where(and(
        eq(flashcards.userId, userId),
        lte(flashcards.nextReview, now)
      ))
      .orderBy(asc(flashcards.nextReview));
  }

  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const [newFlashcard] = await db.insert(flashcards).values(flashcard).returning();
    return newFlashcard;
  }

  async updateFlashcard(id: string, updates: Partial<Flashcard>): Promise<Flashcard> {
    const [updatedFlashcard] = await db.update(flashcards).set(updates).where(eq(flashcards.id, id)).returning();
    return updatedFlashcard;
  }

  async getExamsByUser(userId: string): Promise<Exam[]> {
    return await db.select().from(exams).where(eq(exams.userId, userId)).orderBy(asc(exams.examDate));
  }

  async getUpcomingExams(userId: string): Promise<Exam[]> {
    const now = new Date();
    return await db.select().from(exams)
      .where(and(
        eq(exams.userId, userId),
        gte(exams.examDate, now)
      ))
      .orderBy(asc(exams.examDate));
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    const [newExam] = await db.insert(exams).values(exam).returning();
    return newExam;
  }

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam> {
    const [updatedExam] = await db.update(exams).set(updates).where(eq(exams.id, id)).returning();
    return updatedExam;
  }

  async deleteExam(id: string): Promise<void> {
    await db.delete(exams).where(eq(exams.id, id));
  }

  async getStudySessionsByUser(userId: string): Promise<StudySession[]> {
    return await db.select().from(studySessions).where(eq(studySessions.userId, userId)).orderBy(desc(studySessions.startTime));
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const [newSession] = await db.insert(studySessions).values(session).returning();
    return newSession;
  }

  async updateStudySession(id: string, updates: Partial<StudySession>): Promise<StudySession> {
    const [updatedSession] = await db.update(studySessions).set(updates).where(eq(studySessions.id, id)).returning();
    return updatedSession;
  }

  async getTodayStudyTime(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await db.select({
      totalDuration: sql<number>`COALESCE(SUM(${studySessions.duration}), 0)`
    })
    .from(studySessions)
    .where(and(
      eq(studySessions.userId, userId),
      gte(studySessions.startTime, today),
      lte(studySessions.startTime, tomorrow)
    ));

    return result[0]?.totalDuration || 0;
  }

  async getUserGoals(userId: string): Promise<UserGoal[]> {
    return await db.select().from(userGoals).where(eq(userGoals.userId, userId)).orderBy(desc(userGoals.createdAt));
  }

  async createUserGoal(goal: InsertUserGoal): Promise<UserGoal> {
    const [newGoal] = await db.insert(userGoals).values(goal).returning();
    return newGoal;
  }

  async updateUserGoal(id: string, updates: Partial<UserGoal>): Promise<UserGoal> {
    const [updatedGoal] = await db.update(userGoals).set(updates).where(eq(userGoals.id, id)).returning();
    return updatedGoal;
  }

  async getUserRewards(userId: string): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.userId, userId)).orderBy(desc(rewards.createdAt));
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const [newReward] = await db.insert(rewards).values(reward).returning();
    return newReward;
  }

  async updateReward(id: string, updates: Partial<Reward>): Promise<Reward> {
    const [updatedReward] = await db.update(rewards).set(updates).where(eq(rewards.id, id)).returning();
    return updatedReward;
  }
}

export const storage = new DatabaseStorage();
