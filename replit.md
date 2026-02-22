# YsUp Campus Platform

## Overview
YsUp Campus Network is an HBCU-focused educational platform built with Next.js 14 (App Router). It features an AI-powered academic search engine, campus social network with dashboard, bookstore, academy, bulletin board, game features, and messaging.

## Project Architecture
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes (App Router) for search, AI, and auth
- **Auth**: Next.js server actions with PostgreSQL + bcryptjs password hashing, localStorage session on client
- **AI**: OpenAI (gpt-4o-mini) via Replit AI Integrations for summaries and overviews

### Directory Structure
- `/app` - Next.js App Router pages, API routes, and server actions
- `/app/api` - API routes: books, scholar, wiki, web-search, ai-overview, summarize, search-users, book-image, networks
- `/app/api/networks` - Class Networks API: CRUD, search, join, posts, cosign, respond, moderator requests
- `/app/networks/[slug]` - Network detail page with feed, members, moderator panel
- `/app/invite/network/[slug]` - Invite link handler with auth redirect
- `/app/search` - AI-powered academic search engine page
- `/components` - Shared React components (Header, theme-provider)
- `/lib` - Utility functions (db.ts for PostgreSQL pool)
- `/public` - Static assets and images

## Configuration
- **Dev server**: `pnpm next dev --turbo -H 0.0.0.0 -p 5000` (Turbopack for fast compilation, no recompilation loop)
- **Package manager**: pnpm
- **Deployment**: Autoscale with `pnpm build` and `pnpm next-start`
- **Database**: PostgreSQL (Replit built-in) for user auth and AI summary caching
- **React**: v18.3.1 (required for Next.js 14 compatibility)
- **All API routes**: Use `export const dynamic = 'force-dynamic'` for production builds
- **Pre-warm**: Dev workflow pre-requests / and /search pages after startup for faster first load

## Search Engine Features
- **Google Books API** (`/api/books`) - Book search with 3D blue-themed carousel
- **OpenAlex API** (`/api/scholar`) - Scholarly articles with 3D emerald-themed journal carousel
- **Wikipedia API** (`/api/wiki`) - Encyclopedia article search
- **DuckDuckGo** (`/api/web-search`) - Free web search via HTML parsing
- **Campus Users** (`/api/search-users`) - PostgreSQL user search by name/username
- **AI Overview** (`/api/ai-overview`) - OpenAI-generated topic overviews with PostgreSQL caching
- **AI Summarize** (`/api/summarize`) - OpenAI-generated summaries with PostgreSQL caching
- **Book Image Proxy** (`/api/book-image`) - Server-side proxy for Google Books covers
- **Search categories** (sidebar order): Everything, Books, Scholarly Articles, Web, Encyclopedia, Campus Users
- All searches run once via Promise.allSettled; tab switching filters cached results

## User Preferences
- HBCU-focused platform with all 100+ HBCUs in signup dropdown
- Wood/amber themed UI design
- Blue book carousel, emerald journal carousel
- Search categories ordered: Everything, Books, Scholarly Articles, Web, Encyclopedia, Campus Users

## Class Networks Feature
- PostgreSQL-backed social networking within classes/clubs/organizations
- API routes: `/api/networks` (CRUD, search, mine, join, posts, cosign, respond, requests, approve, deny)
- Dashboard notebook modal replaced with real API-backed Class Networks UI
- Network detail page at `/networks/[slug]` with feed, members, moderator panel
- Invite links at `/invite/network/[slug]` with login redirect for unauthenticated users
- Public networks: instant join; Private networks: moderator approval required
- Post creation, co-signing, and threaded responses
- PostgreSQL tables: class_networks, network_members, network_join_requests, network_posts, network_post_responses

## YsUp Bluebook Calendar Feature
- PostgreSQL-backed event/calendar system accessible from the dashboard Bluebook item
- API routes: `/api/events` (create/list events), `/api/events/rsvp` (RSVP responses), `/api/events/invites` (pending invitations), `/api/events/network-members` (fetch members for inviting)
- API routes: `/api/events/seed-howard` (POST to seed Howard University 2025-2026 academic calendar), `/api/events/notify-cron` (POST for notification cron)
- Event creation: Title, description, date, time (nullable for all-day events), location fields
- Network-based invitations: Invite entire Class Networks or pick individual members from joined networks
- RSVP system: Three states (going/maybe/not_going) with real-time tallies displayed on each event
- Pending invites section: Shows unresponded invitations with quick RSVP buttons
- Event deletion: Only event creators can delete their events (cascades to invites)
- Header notifications: Fetches real pending event invites as notification badges
- Howard University Academic Calendar: 79 events from 2025-2026 official calendar seeded for all Howard University users
- University events scoped by `source = 'howard_university'` column on calendar_events table; only shown to users with `college = 'Howard University'`
- New Howard University users auto-enrolled in all university calendar events on signup
- Notification cron: All-day events trigger notifications daily; timed events trigger alerts 2 hours prior
- PostgreSQL tables: calendar_events (with source column), event_invites with proper foreign keys and indexes
- Bluebook preview card shows current date dynamically (no hardcoded dates)

## Sticky Notes Feature
- PostgreSQL-backed sticky notes on dashboard with full persistence
- API routes: `/api/notes` (CRUD - create, read, update, delete)
- Notes saved to `user_sticky_notes` table with content, position, and rotation
- Position updates persisted on drag/move
- Content updates persisted on save
- Notes load from database on dashboard mount, persist across logout/login

## File Upload Feature
- PostgreSQL-backed file storage on dashboard
- API routes: `/api/files` (CRUD - upload, list, delete with lazy file data loading)
- Files saved to `user_files` table with metadata and base64 file data
- File data loaded on demand (not in list response) for performance
- PostgreSQL table: user_files

## The Game - Online AI Coaching Feature
- Two game modes: In-Person (classroom) and Online AI (AI coaching sessions)
- API routes: `/api/game/online/start` (create session), `/api/game/online/[sessionId]/message` (chat with AI coach), `/api/game/online/[sessionId]/arrived` (answer arrived, awards 10 YBucks), `/api/game/online/[sessionId]/end` (end session, awards 250 coach bonus)
- API route: `/api/game/inperson/award` (award YBucks to users by username in in-person games)
- AI Coach uses GPT-4o-mini via Replit AI Integrations with strict Socratic teaching method (never gives direct answers)
- Online AI Chalkboard page at `/game/online/[sessionId]` with dark green chalkboard UI
- YBucks amounts: 10 for arriving at answer, 250 coach bonus at session end
- Authorization checks: users must be session players to interact, only creators can end sessions
- PostgreSQL tables: game_sessions, game_session_players, game_chat_messages, game_ybucks_awards
- Users table has `ybucks` column for tracking currency balance

## Notifications System
- API routes: `/api/notifications` (list with unread count), `/api/notifications/read` (mark individual or all as read)
- Header bell icon with dropdown showing real notifications from DB + event invites
- 30-second polling for real-time notification updates
- Notification types: YBUCKS_EARNED, event_invite, general
- PostgreSQL table: notifications with user_id, type, title, message, meta (JSONB), read flag

## Bison Web - Howard.edu Magazine Browser
- Skeuomorphic open two-page magazine design on a wooden desk background
- 8 content sections: Home, News, Academics, Admissions, Campus Life, Events, Research, Legacy
- All content mirrors real howard.edu website data (news articles, events, alumni, programs)
- Page navigation: clicking a nav link loads content on right page, shifts previous right content to left page
- Slide transitions: content slides in/out with translateX and opacity animations (500ms duration)
- Spine divider between pages with wood grain texture and shadow effects
- Page textures with parchment-style gradients and subtle edge shadows
- Mobile responsive: pages stack vertically (current page on top, previous below) with horizontal spine divider
- Nav bar with icons and aria-current/aria-label for accessibility
- Custom scrollbars on each page matching the parchment aesthetic
- External links to howard.edu, thedig.howard.edu, events.howard.edu, admission.howard.edu

## Recent Changes
- Replaced Bison Web (old student information system) with skeuomorphic Howard.edu magazine browser
- Full mobile-responsive design: All pages (login, home, search, dashboard, networks, onboarding, bookstore, bulletin board, academy, bison web, hilltop, the game) now use responsive Tailwind breakpoints for mobile-friendly layouts
- Mobile search: Sidebar category list converts to horizontal scrollable tab strip on small screens
- Mobile carousels: 3D book/journal carousels scale to 75% with fewer visible items on mobile
- Mobile layouts: Vertical stacking, responsive font sizes, reduced padding, single-column grids on small screens
- Mobile navigation: Header hamburger menu with slide-out drawer for all nav items
- Added Class Networks feature: create/join/search networks, post feed, invite links, moderator tools
- Replaced hardcoded dashboard class network data with real PostgreSQL-backed API
- Reordered search category sidebar: Everything, Books, Scholarly Articles, Web, Encyclopedia, Campus Users
- Redesigned book carousel: Blue-themed styled covers matching journal carousel design (removed Google Books image loading)
- Fixed dev server stability: Switched to Turbopack (--turbo) to eliminate constant webpack recompilation loop
- Fixed React version: Downgraded from React 19 to 18.3.1 for Next.js 14 compatibility
- Fixed AI overview/summarize duplicate key errors: Added ON CONFLICT DO UPDATE to PostgreSQL inserts
- Added force-dynamic exports to all API routes for production build compatibility
- Scholar API: Replaced unreliable Google Scholar scraping with OpenAlex API (free, reliable, 240M+ works)
- Single search: Search runs once on submit, results cached, tab switching just filters
- AI-powered academic search engine with wood/amber themed UI
- Onboarding wizard with 10-step guided setup for new students
- PostgreSQL auth with bcryptjs password hashing
