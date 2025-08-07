import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertFileSchema, insertFolderSchema, insertExamSchema, insertStudySessionSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { translateDocument } from "./services/translation";
import { generateFlashcards, calculateNextReview } from "./services/review";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and PPTX files are allowed.'));
    }
  },
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get today's study time
      const todayStudyTime = await storage.getTodayStudyTime(userId);
      
      // Get total files
      const files = await storage.getFilesByUser(userId);
      const studiedFiles = files.filter(f => f.studyProgress > 0).length;
      
      // Get user goals
      const goals = await storage.getUserGoals(userId);
      const dailyGoal = goals.find(g => g.goalType === 'daily_hours' && g.isActive);
      const dailyGoalProgress = dailyGoal ? 
        Math.min(100, (todayStudyTime / (dailyGoal.targetValue * 60)) * 100) : 0;
      
      // Get achievement points (simplified calculation)
      const achievementPoints = Math.floor(todayStudyTime * 10) + (studiedFiles * 50);
      
      res.json({
        todayHours: (todayStudyTime / 60).toFixed(1),
        studiedFiles,
        achievementPoints,
        dailyGoalProgress: Math.round(dailyGoalProgress),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Recent files
  app.get("/api/files/recent", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 5;
      const files = await storage.getRecentFiles(userId, limit);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent files" });
    }
  });

  // File management
  app.get("/api/files", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const folderId = req.query.folderId as string;
      
      let files;
      if (folderId) {
        files = await storage.getFilesByFolder(folderId);
      } else {
        files = await storage.getFilesByUser(userId);
      }
      
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get("/api/files/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const file = await storage.getFile(id);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.post("/api/files/upload", requireAuth, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.id;
      const { folderId } = req.body;

      const fileData = {
        name: path.parse(req.file.originalname).name,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileType: path.extname(req.file.originalname).toLowerCase(),
        fileSize: req.file.size,
        userId,
        folderId: folderId || null,
      };

      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.put("/api/files/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const file = await storage.updateFile(id, updates);
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  app.delete("/api/files/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Get file info to delete physical file
      const file = await storage.getFile(id);
      if (file && fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
      
      await storage.deleteFile(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Folder management
  app.get("/api/folders", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const folders = await storage.getFoldersByUser(userId);
      res.json(folders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.post("/api/folders", requireAuth, async (req: any, res) => {
    try {
      const folderData = insertFolderSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const folder = await storage.createFolder(folderData);
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid folder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  app.delete("/api/folders/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFolder(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  // Translation
  app.post("/api/files/:id/translate", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { targetLanguage = 'ar' } = req.body;
      
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Start translation process
      const result = await translateDocument(file, targetLanguage);
      
      // Update file translation status
      await storage.updateFile(id, { 
        isTranslated: true, 
        translationProgress: 100 
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Translation failed" });
    }
  });

  app.get("/api/files/:id/translations", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const translations = await storage.getTranslationsByFile(id);
      res.json(translations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch translations" });
    }
  });

  // Flashcards
  app.get("/api/flashcards", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const flashcards = await storage.getFlashcardsByUser(userId);
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flashcards" });
    }
  });

  app.get("/api/flashcards/due", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const flashcards = await storage.getFlashcardsDueForReview(userId);
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch due flashcards" });
    }
  });

  app.post("/api/files/:id/flashcards/generate", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      const flashcards = await generateFlashcards(file, userId);
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate flashcards" });
    }
  });

  app.post("/api/flashcards/:id/review", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { correct, difficulty } = req.body;
      
      const flashcard = await storage.getFlashcardsDueForReview(req.user.id);
      const card = flashcard.find(f => f.id === id);
      
      if (!card) {
        return res.status(404).json({ message: "Flashcard not found" });
      }

      const nextReview = calculateNextReview(card, correct, difficulty);
      const updates = {
        nextReview,
        reviewCount: card.reviewCount + 1,
        correctStreak: correct ? card.correctStreak + 1 : 0,
        difficulty: difficulty || card.difficulty,
      };

      const updatedCard = await storage.updateFlashcard(id, updates);
      res.json(updatedCard);
    } catch (error) {
      res.status(500).json({ message: "Failed to update flashcard review" });
    }
  });

  // Exams
  app.get("/api/exams", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const exams = await storage.getExamsByUser(userId);
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.get("/api/exams/upcoming", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const exams = await storage.getUpcomingExams(userId);
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming exams" });
    }
  });

  app.post("/api/exams", requireAuth, async (req, res) => {
    try {
      const examData = insertExamSchema.parse(req.body);
      const exam = await storage.createExam(examData);
      res.status(201).json(exam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exam data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  app.delete("/api/exams/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExam(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete exam" });
    }
  });

  // Study sessions
  app.get("/api/study-sessions", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessions = await storage.getStudySessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch study sessions" });
    }
  });

  app.post("/api/study-sessions", requireAuth, async (req, res) => {
    try {
      const sessionData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create study session" });
    }
  });

  app.put("/api/study-sessions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const session = await storage.updateStudySession(id, updates);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update study session" });
    }
  });

  // Annotations
  app.get("/api/files/:id/annotations", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const annotations = await storage.getAnnotationsByFile(id);
      res.json(annotations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch annotations" });
    }
  });

  app.post("/api/files/:id/annotations", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const annotationData = { ...req.body, fileId: id };
      const annotation = await storage.createAnnotation(annotationData);
      res.status(201).json(annotation);
    } catch (error) {
      res.status(500).json({ message: "Failed to create annotation" });
    }
  });

  app.delete("/api/annotations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAnnotation(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete annotation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
