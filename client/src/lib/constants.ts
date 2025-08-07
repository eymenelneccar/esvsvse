// App configuration constants
export const APP_LOCK_PASSWORD = "235711";

// Pomodoro timer settings
export const POMODORO_WORK_DURATION = 25 * 60; // 25 minutes in seconds
export const POMODORO_BREAK_DURATION = 5 * 60; // 5 minutes in seconds
export const POMODORO_LONG_BREAK_DURATION = 15 * 60; // 15 minutes in seconds

// File upload settings
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = ['.pdf', '.docx', '.pptx'];

// Review intervals (in days)
export const REVIEW_INTERVALS = {
  EASY: [1, 6, 14, 30, 90],
  MEDIUM: [1, 3, 7, 21, 60],
  HARD: [1, 1, 3, 10, 30],
};

// Goal types
export const GOAL_TYPES = {
  DAILY_HOURS: 'daily_hours',
  WEEKLY_FILES: 'weekly_files',
  MONTHLY_REVIEWS: 'monthly_reviews',
};

// Session types
export const SESSION_TYPES = {
  READING: 'reading',
  REVIEW: 'review',
  TRANSLATION: 'translation',
  FOCUS: 'focus',
};

// Notification settings
export const EXAM_REMINDER_DAYS = [14, 7, 3, 1]; // Days before exam to send reminders

// UI Constants
export const SIDEBAR_WIDTH = 256; // 16rem in pixels
export const HEADER_HEIGHT = 80; // 5rem in pixels

// Colors for file types
export const FILE_TYPE_COLORS = {
  '.pdf': 'bg-red-100 text-red-600',
  '.docx': 'bg-blue-100 text-blue-600',
  '.pptx': 'bg-green-100 text-green-600',
  default: 'bg-gray-100 text-gray-600',
};

// Default user settings
export const DEFAULT_USER_SETTINGS = {
  pomodoroWorkDuration: POMODORO_WORK_DURATION,
  pomodoroBreakDuration: POMODORO_BREAK_DURATION,
  dailyGoalHours: 4,
  reminderNotifications: true,
  soundEnabled: true,
  theme: 'light',
  language: 'ar',
};
