# YsUp Campus Platform

## Overview
YsUp Campus Network is an educational platform built with Next.js 14 (App Router) and an Express.js backend API. It features a campus social network with dashboard, bookstore, academy, bulletin board, game features, and messaging.

## Project Architecture
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js API server (server.js) with MongoDB (Mongoose)
- **Real-time**: Socket.io for messaging
- **Auth**: Server actions for frontend auth, JWT-based Express middleware for API

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
- **Database**: MongoDB via Mongoose (requires MONGODB_URI env var for backend)

## Recent Changes
- Configured for Replit environment (port 5000, host 0.0.0.0)
- Set up deployment configuration
