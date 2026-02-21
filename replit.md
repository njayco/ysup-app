# YsUp Campus Platform

## Overview
YsUp Campus Network is an educational platform built with Next.js 14 (App Router) and an Express.js backend API. It features a campus social network with dashboard, bookstore, academy, bulletin board, game features, and messaging.

## Project Architecture
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js API server (server.js) with MongoDB (Mongoose)
- **Real-time**: Socket.io for messaging
- **Auth**: Next.js server actions with PostgreSQL + bcryptjs password hashing, localStorage session on client

### Directory Structure
- `/app` - Next.js App Router pages and server actions
- `/components` - Shared React components (Header, theme-provider)
- `/lib` - Utility functions
- `/config` - Database configuration
- `/middleware` - Express middleware (auth, error handling, validation)
- `/models` - Mongoose models (User, Course, Event, File, etc.)
- `/routes` - Express API routes
- `/scripts` - Database seed and setup scripts
- `/socket` - Socket.io handlers
- `/public` - Static assets and images

## Configuration
- **Dev server**: `pnpm dev` runs Next.js on port 5000 (0.0.0.0)
- **Package manager**: pnpm
- **Deployment**: Autoscale with `pnpm build` and `pnpm next-start`
- **Backend**: Express server on separate port (not currently integrated with frontend dev workflow)
- **Database**: PostgreSQL (Replit built-in) for user auth; MongoDB via Mongoose for backend API (requires MONGODB_URI env var)

## Recent Changes
- Rebuilt onboarding page (/onboarding) with full guided setup wizard:
  - Step 1: Student Profile Setup with major, year, bio fields and completion checklist (required before proceeding)
  - Steps 2-10: Feature walkthroughs for Dashboard, YsUp Book, YBucks system, HU Bookstore, Bulletin Board, The Hilltop, The Game, Bison Web, Academy with detailed explanations and tips
  - Final completion step with summary and Go to Dashboard button
  - Profile data saved to localStorage on step transitions and completion
- Signup now redirects to onboarding instead of dashboard; uses window.location.href for reliable navigation
- Fixed signup getting stuck by adding proper error handling (finally block resets loading state)
- Added PostgreSQL database with users table for authentication (username, phone, password_hash, first_name, last_name, college)
- Simplified login to single identifier field (accepts +username or phone number)
- Auth uses bcryptjs for password hashing, pg for database queries
- Phone numbers normalized on signup/login for consistent matching
- Auth guard (useAuth hook) on protected pages redirects to /login
- Configured for Replit environment (port 5000, host 0.0.0.0)
- Set up deployment configuration
