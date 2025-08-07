import { File, Flashcard } from "@shared/schema";
import { storage } from "../storage";
import { generateFlashcardsFromText, extractKeyPoints } from "./openai";
import fs from "fs";

// Spaced repetition algorithm (SM-2)
export function calculateNextReview(
  flashcard: Flashcard, 
  correct: boolean, 
  newDifficulty?: number
): Date {
  const now = new Date();
  let interval = 1; // days
  
  if (correct) {
    // Successful review
    switch (flashcard.correctStreak) {
      case 0:
        interval = 1;
        break;
      case 1:
        interval = 6;
        break;
      default:
        // SM-2 algorithm: interval = previous_interval * ease_factor
        // Simplified version
        interval = Math.round(
          (flashcard.correctStreak - 1) * 6 * (2.5 - (flashcard.difficulty - 1) * 0.3)
        );
        break;
    }
  } else {
    // Failed review - reset to beginning
    interval = 1;
  }
  
  // Adjust based on difficulty
  const difficultyMultiplier = newDifficulty ? (6 - newDifficulty) * 0.2 : 1;
  interval = Math.max(1, Math.round(interval * difficultyMultiplier));
  
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + interval);
  
  return nextReview;
}

export async function generateFlashcards(file: File, userId: string): Promise<Flashcard[]> {
  try {
    // Extract text from file (simplified)
    let content: string;
    try {
      content = fs.readFileSync(file.filePath, 'utf8');
    } catch {
      // For binary files, use a placeholder
      content = `Educational content from ${file.name}. This would contain the actual extracted text from the ${file.fileType} file.`;
    }
    
    // Limit content length for API efficiency
    const maxLength = 4000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + "...";
    }
    
    // Generate flashcards using AI
    const aiFlashcards = await generateFlashcardsFromText(content, 10);
    
    const flashcards: Flashcard[] = [];
    
    // Create flashcards in database
    for (const aiCard of aiFlashcards) {
      const flashcardData = {
        fileId: file.id,
        userId,
        front: aiCard.front,
        back: aiCard.back,
        difficulty: 3, // Default difficulty
        reviewCount: 0,
        correctStreak: 0,
        tags: await extractTagsFromContent(aiCard.front + " " + aiCard.back),
      };
      
      const flashcard = await storage.createFlashcard(flashcardData);
      flashcards.push(flashcard);
    }
    
    return flashcards;
  } catch (error) {
    console.error("Failed to generate flashcards:", error);
    throw new Error("Failed to generate flashcards from file content");
  }
}

async function extractTagsFromContent(content: string): Promise<string[]> {
  try {
    const keyPoints = await extractKeyPoints(content);
    // Convert key points to tags (simplified approach)
    return keyPoints.slice(0, 5).map(point => 
      point.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(' ')
        .slice(0, 2)
        .join('_')
    );
  } catch {
    return [];
  }
}

export async function getReviewStatistics(userId: string): Promise<{
  totalCards: number;
  dueForReview: number;
  reviewedToday: number;
  averageAccuracy: number;
  streakData: { [key: string]: number };
}> {
  try {
    const allCards = await storage.getFlashcardsByUser(userId);
    const dueCards = await storage.getFlashcardsDueForReview(userId);
    
    // Calculate today's reviews (simplified)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviewedToday = allCards.filter(card => {
      const lastReview = new Date(card.nextReview);
      lastReview.setDate(lastReview.getDate() - 1); // Approximate last review date
      return lastReview >= today;
    }).length;
    
    // Calculate average accuracy (simplified)
    const totalReviews = allCards.reduce((sum, card) => sum + card.reviewCount, 0);
    const totalCorrect = allCards.reduce((sum, card) => 
      sum + Math.min(card.correctStreak, card.reviewCount), 0
    );
    const averageAccuracy = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;
    
    // Streak data
    const streakData: { [key: string]: number } = {
      '0': 0, '1-3': 0, '4-7': 0, '8-15': 0, '16+': 0
    };
    
    allCards.forEach(card => {
      const streak = card.correctStreak;
      if (streak === 0) streakData['0']++;
      else if (streak <= 3) streakData['1-3']++;
      else if (streak <= 7) streakData['4-7']++;
      else if (streak <= 15) streakData['8-15']++;
      else streakData['16+']++;
    });
    
    return {
      totalCards: allCards.length,
      dueForReview: dueCards.length,
      reviewedToday,
      averageAccuracy: Math.round(averageAccuracy),
      streakData,
    };
  } catch (error) {
    console.error("Failed to get review statistics:", error);
    return {
      totalCards: 0,
      dueForReview: 0,
      reviewedToday: 0,
      averageAccuracy: 0,
      streakData: {},
    };
  }
}

export function getDifficultyRecommendation(
  accuracy: number,
  responseTime: number // in seconds
): number {
  // Recommend difficulty based on performance
  if (accuracy >= 90 && responseTime <= 5) return 5; // Very easy
  if (accuracy >= 80 && responseTime <= 10) return 4; // Easy
  if (accuracy >= 60 && responseTime <= 20) return 3; // Medium
  if (accuracy >= 40 && responseTime <= 30) return 2; // Hard
  return 1; // Very hard
}

export async function scheduleReviewReminders(userId: string): Promise<void> {
  try {
    const dueCards = await storage.getFlashcardsDueForReview(userId);
    
    if (dueCards.length > 0) {
      // In a real application, you would send notifications here
      // For now, we'll just log the reminder
      console.log(`User ${userId} has ${dueCards.length} flashcards due for review`);
      
      // You could integrate with email services, push notifications, etc.
      // Example: await sendEmailReminder(userId, dueCards.length);
      // Example: await sendPushNotification(userId, "Time to review your flashcards!");
    }
  } catch (error) {
    console.error("Failed to schedule review reminders:", error);
  }
}
