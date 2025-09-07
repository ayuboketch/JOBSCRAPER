# Overview

JobTracker is a full-stack web application for tracking job opportunities and company career pages. Users can add companies they're interested in, automatically scrape job listings from their career pages, and manage their job application pipeline. The application features automated job discovery through web scraping with keyword matching, user authentication, and a mobile-responsive interface built with React and shadcn/ui components.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server

**UI Library**: shadcn/ui components built on top of Radix UI primitives, providing a comprehensive set of accessible components including forms, dialogs, navigation, and data display elements

**Styling**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes with user preference persistence

**State Management**: React Query (TanStack Query) for server state management, React Context for authentication and theme state, with local state managed through React hooks

**Routing**: Wouter for lightweight client-side routing with support for protected routes and navigation state

**Mobile-First Design**: Responsive layout with dedicated mobile navigation (bottom tabs) and desktop-friendly components, using a drawer-based navigation pattern

## Backend Architecture

**Runtime**: Node.js with Express.js framework for REST API endpoints

**Language**: TypeScript with ES modules for type safety and modern JavaScript features

**Database ORM**: Drizzle ORM for type-safe database operations with PostgreSQL as the target database

**Authentication**: Supabase Auth for user authentication and session management with JWT tokens

**API Design**: RESTful endpoints following standard HTTP methods and status codes, with middleware for authentication and error handling

## Data Storage Solutions

**Primary Database**: PostgreSQL (configured for Neon/Supabase) with the following schema:
- Users table for authentication and profile data
- Companies table for tracked companies with scraping configurations
- Jobs table for discovered job opportunities with application status tracking

**Schema Management**: Drizzle Kit for database migrations and schema evolution

**Data Relationships**: Foreign key relationships between users, companies, and jobs with proper cascade handling

## Authentication and Authorization

**Provider**: Supabase Authentication system providing secure user registration, login, and session management

**Token Management**: JWT tokens stored in localStorage with automatic inclusion in API requests via custom fetch wrapper

**Protected Routes**: Authentication middleware on both client and server sides, with automatic redirects for unauthenticated users

**User Context**: React Context provider for global authentication state management across the application

## External Dependencies

**UI Framework**: Radix UI primitives for accessible, unstyled components that form the foundation of the shadcn/ui component library

**Database Provider**: Configured for Neon Database (PostgreSQL-compatible) with Supabase as the authentication and database service provider

**Development Tools**: 
- Vite for fast development and optimized production builds
- TypeScript for static type checking
- Tailwind CSS for utility-first styling
- React Query for efficient data fetching and caching

**Web Scraping Infrastructure**: Playwright for automated browser automation and job listing extraction (referenced in attached assets), with support for dynamic content rendering

**Build and Deployment**: ESBuild for server-side bundling with Node.js target, Vite for client-side bundling with optimized asset handling