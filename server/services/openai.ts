import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function translateText(text: string, targetLanguage: string = 'ar'): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the given text to ${targetLanguage === 'ar' ? 'Arabic' : targetLanguage} while maintaining the academic context and technical terminology. Preserve the original meaning and structure.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content || text;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate text");
  }
}

export async function generateFlashcardsFromText(text: string, count: number = 10): Promise<Array<{front: string, back: string}>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an educational content creator. Generate ${count} high-quality flashcards from the given text. Each flashcard should have a clear question on the front and a comprehensive answer on the back. Focus on key concepts, definitions, and important facts. Respond with JSON in this format: {"flashcards": [{"front": "question", "back": "answer"}]}`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"flashcards": []}');
    return result.flashcards || [];
  } catch (error) {
    console.error("Flashcard generation error:", error);
    throw new Error("Failed to generate flashcards");
  }
}

export async function analyzeDocumentContent(text: string): Promise<{
  summary: string;
  keyTopics: string[];
  difficulty: number;
  estimatedReadingTime: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze the given educational document and provide a comprehensive analysis. Respond with JSON in this format: {
            "summary": "brief summary of the content",
            "keyTopics": ["topic1", "topic2", "topic3"],
            "difficulty": 3,
            "estimatedReadingTime": 15
          }
          
          Difficulty should be 1-5 (1=beginner, 5=advanced).
          Estimated reading time should be in minutes.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      summary: result.summary || "No summary available",
      keyTopics: result.keyTopics || [],
      difficulty: result.difficulty || 3,
      estimatedReadingTime: result.estimatedReadingTime || 10,
    };
  } catch (error) {
    console.error("Document analysis error:", error);
    throw new Error("Failed to analyze document");
  }
}

export async function generateQuizQuestions(text: string, count: number = 5): Promise<Array<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Generate ${count} multiple-choice quiz questions from the given text. Each question should have 4 options with one correct answer. Respond with JSON in this format: {
            "questions": [{
              "question": "What is...?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": 0,
              "explanation": "Explanation of why this is correct"
            }]
          }`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
    return result.questions || [];
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function extractKeyPoints(text: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Extract the key points and important information from the given text. Respond with JSON in this format: {"keyPoints": ["point1", "point2", "point3"]}`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"keyPoints": []}');
    return result.keyPoints || [];
  } catch (error) {
    console.error("Key points extraction error:", error);
    throw new Error("Failed to extract key points");
  }
}
