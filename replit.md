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

## Recent Changes
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
