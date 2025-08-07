import { File } from "@shared/schema";
import { translateText } from "./openai";
import { storage } from "../storage";
import fs from "fs";
import path from "path";

// Simple text extraction for demo - in production you'd use proper PDF/DOCX parsers
async function extractTextFromFile(filePath: string, fileType: string): Promise<string[]> {
  // This is a simplified implementation
  // In production, you would use libraries like:
  // - pdf-parse for PDF files
  // - mammoth for DOCX files
  // - node-pptx for PowerPoint files
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Split content into pages/sections for translation
    return content.split('\n\n').filter(text => text.trim().length > 0);
  } catch (error) {
    // For binary files, return placeholder content
    return [`Content from ${fileType} file - Page 1`, `Content from ${fileType} file - Page 2`];
  }
}

export async function translateDocument(file: File, targetLanguage: string = 'ar'): Promise<{
  success: boolean;
  translatedPages: number;
  message: string;
}> {
  try {
    // Extract text from the document
    const textPages = await extractTextFromFile(file.filePath, file.fileType);
    
    let translatedPages = 0;
    
    // Translate each page/section
    for (let i = 0; i < textPages.length; i++) {
      const originalText = textPages[i];
      
      if (originalText.trim().length === 0) continue;
      
      try {
        // Translate the text
        const translatedText = await translateText(originalText, targetLanguage);
        
        // Store the translation
        await storage.createTranslation({
          fileId: file.id,
          pageNumber: i + 1,
          originalText,
          translatedText,
          sourceLanguage: 'en', // Assume English source for now
          targetLanguage,
        });
        
        translatedPages++;
        
        // Update file translation progress
        const progress = Math.round((translatedPages / textPages.length) * 100);
        await storage.updateFile(file.id, { translationProgress: progress });
        
      } catch (error) {
        console.error(`Failed to translate page ${i + 1}:`, error);
      }
    }
    
    // Mark file as translated if at least 80% was translated
    const isTranslated = (translatedPages / textPages.length) >= 0.8;
    await storage.updateFile(file.id, { 
      isTranslated,
      translationProgress: isTranslated ? 100 : Math.round((translatedPages / textPages.length) * 100)
    });
    
    return {
      success: true,
      translatedPages,
      message: `Successfully translated ${translatedPages} out of ${textPages.length} pages`
    };
    
  } catch (error) {
    console.error("Document translation error:", error);
    return {
      success: false,
      translatedPages: 0,
      message: "Failed to translate document"
    };
  }
}

export async function getTranslatedContent(fileId: string): Promise<{
  originalPages: string[];
  translatedPages: string[];
}> {
  try {
    const translations = await storage.getTranslationsByFile(fileId);
    
    const originalPages: string[] = [];
    const translatedPages: string[] = [];
    
    translations.forEach(translation => {
      originalPages[translation.pageNumber - 1] = translation.originalText;
      translatedPages[translation.pageNumber - 1] = translation.translatedText;
    });
    
    return { originalPages, translatedPages };
  } catch (error) {
    console.error("Failed to get translated content:", error);
    return { originalPages: [], translatedPages: [] };
  }
}

export async function retranslateSection(
  fileId: string, 
  pageNumber: number, 
  newTargetLanguage: string
): Promise<{ success: boolean; message: string }> {
  try {
    const translations = await storage.getTranslationsByFile(fileId);
    const existingTranslation = translations.find(t => t.pageNumber === pageNumber);
    
    if (!existingTranslation) {
      return { success: false, message: "Translation not found" };
    }
    
    // Re-translate the original text
    const newTranslation = await translateText(existingTranslation.originalText, newTargetLanguage);
    
    // Update the translation
    await storage.createTranslation({
      fileId,
      pageNumber,
      originalText: existingTranslation.originalText,
      translatedText: newTranslation,
      sourceLanguage: existingTranslation.sourceLanguage,
      targetLanguage: newTargetLanguage,
    });
    
    return { success: true, message: "Section retranslated successfully" };
  } catch (error) {
    console.error("Retranslation error:", error);
    return { success: false, message: "Failed to retranslate section" };
  }
}
