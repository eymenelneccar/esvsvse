# Study∀ - Smart Study Application

## Overview

Study∀ is a comprehensive Arabic-language study application designed specifically for Arab students. The platform integrates intelligent features including document translation, smart review systems, productivity tracking, and focus tools. Built as a full-stack web application, it provides an all-in-one solution for modern digital learning with emphasis on Arabic language support and cultural considerations.

The application features a sophisticated document management system, AI-powered translation services, spaced repetition learning algorithms, and productivity analytics to help students optimize their study workflows and achieve better learning outcomes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: Right-to-left (RTL) layout support with Arabic and English font integration
- **UI Components**: Comprehensive set of accessible components using Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API development
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Authentication**: Passport.js with local strategy and session-based authentication
- **File Processing**: Multer for file upload handling with support for PDF, DOCX, and PPTX files
- **API Design**: RESTful endpoints with proper error handling and request validation

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL for scalable cloud database hosting
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **File Storage**: Local filesystem storage for uploaded documents with configurable paths
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization

### Authentication and Authorization
- **Strategy**: Session-based authentication using Passport.js local strategy
- **Password Security**: Scrypt-based password hashing with cryptographically secure salts
- **Session Management**: Express sessions with PostgreSQL persistence
- **Route Protection**: Middleware-based authentication guards for protected routes
- **User Management**: User registration, login, and profile management with role-based access

### Key Features Architecture
- **Document Translation**: Integration with OpenAI GPT-4o for intelligent Arabic translation services
- **Smart Review System**: Spaced repetition algorithm (SM-2) for optimized learning retention
- **Flashcard Generation**: AI-powered flashcard creation from document content
- **Productivity Tracking**: Study session logging with time tracking and goal management
- **Focus Tools**: Pomodoro timer implementation with customizable work/break intervals

## External Dependencies

### AI and Translation Services
- **OpenAI API**: GPT-4o model for text translation and flashcard generation
- **Translation Pipeline**: Multi-language support with Arabic as primary target language

### Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations with schema validation
- **WebSocket Support**: Real-time database connections using WebSocket constructor

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom Arabic typography
- **Lucide React**: Consistent icon library for user interface elements
- **Google Fonts**: Cairo and Inter font families for Arabic and English text support

### Development and Build Tools
- **Vite**: Fast build tool with Hot Module Replacement for development
- **esbuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment integration with runtime error handling

### Form and Validation
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: Schema validation for runtime type checking and form validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod validation

### File Processing
- **Multer**: Express middleware for handling multipart/form-data file uploads
- **File Type Support**: PDF, DOCX, and PPTX document processing capabilities
- **File Size Limits**: Configurable upload limits with type validation