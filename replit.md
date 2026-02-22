# YsUp Campus Platform

## Overview
YsUp Campus Network is an HBCU-focused educational platform built with Next.js 14 (App Router). Its core purpose is to provide a comprehensive digital ecosystem for students, featuring an AI-powered academic search engine, a campus social network, a digital bookstore, an academy, a bulletin board, interactive game features with AI coaching, and a messaging system. The platform aims to enhance the academic and social experience for HBCU students.

## User Preferences
- HBCU-focused platform with all 100+ HBCUs in signup dropdown
- Wood/amber themed UI design
- Blue book carousel, emerald journal carousel
- Search categories ordered: Everything, Books, Amazon Books, Dictionary, Scholarly Articles, Web, Images, Videos, News, Maps, Shopping, Encyclopedia, Campus Users
- Images tab: Wooden picture frame skeuomorphic collage with hover download/visit buttons
- Videos tab: CRT TV screen collage with vintage camcorder filter on hover, scanlines, REC indicator
- News tab: Card-based layout with article images and source/date info
- Maps tab: OpenStreetMap embed with DuckDuckGo Maps redirect
- Shopping tab: DuckDuckGo Shopping redirect

## System Architecture
The platform is built on Next.js 14 with TypeScript, utilizing the App Router for both frontend and backend API routes. Tailwind CSS and shadcn/ui components are used for styling and UI. Authentication is handled via Next.js server actions, PostgreSQL for user storage, and bcryptjs for password hashing, with localStorage for client-side sessions. OpenAI (gpt-4o-mini) is integrated via Replit AI for various AI functionalities like summaries, topic overviews, and AI coaching.

### Core Features:
- **AI-Powered Academic Search Engine**: Integrates Google Books, OpenAlex for scholarly articles, Wikipedia, DuckDuckGo for web search, and campus user search. It includes AI-generated topic overviews and summaries, with all search results cached in PostgreSQL for 24 hours.
- **Campus Social Network (Class Networks)**: PostgreSQL-backed system for creating, joining, and managing class/club/organization networks. Features include post feeds, co-signing, threaded responses, member management, moderator tools, invite links, and shared file uploads.
- **YsUp Bluebook Calendar**: A PostgreSQL-backed event and calendar system. It supports event creation with color coding, multi-day events, network-based invitations with RSVP tracking, and notifications. Specific university academic calendars (e.g., Howard University) can be seeded and automatically applied to relevant users.
- **Skeuomorphic Calculator**: A client-side interactive desktop calculator with full arithmetic, memory functions, and a distinct visual design.
- **Productivity Dock (Google Workspace Integration)**: Three skeuomorphic productivity tiles on the dashboard — YsUp Pad (Google Docs), YsUp Calc (Google Sheets), YsUp Slideshow (Google Slides). Uses OAuth 2.0 with encrypted token storage (AES-256-GCM). Users can create, import, and sync documents via Google Workspace APIs (REST). Workspace pages at `/dashboard/pad`, `/dashboard/calc`, `/dashboard/slideshow` with embedded Google editors, search, and sync panels.
- **Sticky Notes**: Dashboard sticky notes with full persistence, allowing users to create, position, and rotate notes, with content and position saved to PostgreSQL.
- **File Upload**: Dashboard file storage with CRUD operations, saving file metadata and base64 data to PostgreSQL, with lazy loading of file data for performance.
- **The Game (Online AI Coaching)**: Offers an online AI coaching mode where GPT-4o-mini acts as a Socratic coach. It includes a reward system (YBucks) for user engagement in sessions.
- **Notifications System**: Real-time notifications for various events (e.g., YBucks earned, event invites, follows, TRUEs) fetched via polling and displayed in a header dropdown. Supports FOLLOW and TRUE notification types with actor tracking.
- **Follow System**: Users can follow/unfollow each other. Follow stats (followers/following counts) displayed on profile pages. Follows table with unique constraint prevents duplicates. Self-follow blocked. Notifications created on follow events. API at `/api/follow`.
- **Public User Profiles**: Yearbook-style open book layout at `/{username}`. Left page: profile photo, name, username, bio, headline, YBUCKS balance (own profile only), follower/following stats, follow button, resume sections, public networks list. Right page: Instagram-style photo gallery with TRUE (like) and comments. Book binding shadow hidden on mobile for clean single-column layout.
- **Bison Web - Howard.edu Magazine Browser**: A skeuomorphic, two-page magazine interface that mirrors content from the real howard.edu website, featuring responsive design and animated page transitions.
- **The Hilltop - Campus Newspaper**: A PDF.js-powered viewer for campus newspapers with a skeuomorphic aesthetic. It includes page navigation and an admin mode for PDF uploads.
- **YsUp Chalkboard (Virtual Meeting Rooms)**: A skeuomorphic chalkboard-themed virtual meeting room system at `/chalkboard`. Uses Google Meet REST API (v2) via Replit's Google Drive connector to create meeting spaces. Features include instant study groups, scheduled class sessions, network-linked rooms, participant tracking, invite system via class networks, meeting history, and RSVP. The UI uses chalk handwriting fonts (Caveat), dark green board backgrounds, chalk dust textures, and chalk tray details. Data stored in `chalkboard_meetings` and `chalkboard_participants` PostgreSQL tables.
- **Twilio SMS Verification**: Phone verification during signup and SMS-based password reset. Uses Twilio SDK for sending 6-digit codes (hashed with bcrypt, 10-min expiry, rate-limited). Inbound SMS webhook at `/api/sms/webhook` with Twilio signature validation stores messages for future 2-way features. Database tables: `sms_verification_codes`, `sms_inbound_messages`. Users table has `phone_verified` and `phone_verified_at` columns. Signup redirects to `/verify-phone` before `/onboarding`. Forgot password flow at `/forgot-password` (3-step: phone -> code -> new password -> auto-login).

### UI/UX and Design:
- **Splash/Loading Screen**: On visiting ysupcampus.com, non-logged-in users see a 4-slide branded splash screen (1.2s per slide, 4.8s total) with fade transitions. Logged-in users see a wooden background with a yellow loading spinner for 2s minimum, then redirect to their last viewed page (tracked via `ysup_last_page` in localStorage). Components: `components/SplashScreen.tsx`, `components/PageTracker.tsx`.
- **Responsive Design**: All pages are fully mobile-responsive using Tailwind breakpoints, adapting layouts, font sizes, and navigation (e.g., hamburger menu, horizontal scrollable tabs for mobile search categories).
- **Skeuomorphic Elements**: Incorporates skeuomorphic designs for the calculator, Bison Web magazine browser, The Hilltop newspaper viewer, and the Chalkboard meeting rooms, enhancing visual engagement.
- **Themed Carousels**: 3D book and journal carousels with distinct blue and emerald themes.

## External Dependencies
- **PostgreSQL**: Primary database for user authentication, AI summary/overview caching, search result caching, class networks data, calendar events, sticky notes, file storage, game sessions, and notifications.
- **OpenAI (gpt-4o-mini)**: Integrated via Replit AI for academic topic overviews, summaries, and the AI coaching feature in "The Game."
- **Google Books API**: Used for book search functionality.
- **OpenAlex API**: Used for scholarly article search, replacing previous unreliable scraping methods.
- **Wikipedia API**: Used for encyclopedia article search.
- **DuckDuckGo**: Utilized for free web search functionality via HTML parsing.
- **Free Dictionary API (dictionaryapi.dev)**: Provides word definitions, phonetics, and related linguistic information.
- **Amazon Books**: Integrated for Amazon book search, including ratings and purchase links.
- **PDF.js**: Used for rendering PDF documents within "The Hilltop" newspaper viewer.
- **Google Workspace APIs (Docs, Sheets, Slides, Drive)**: Used via REST for the Productivity Dock feature. OAuth 2.0 via Replit connectors (google-docs, google-sheet, google-drive). Tokens auto-managed by Replit.
- **Google Meet REST API (v2)**: Used for YsUp Chalkboard to create meeting spaces, end active conferences, and retrieve meeting data. Uses the Google Drive connector token for authentication.
- **Twilio SDK**: Used for SMS sending (verification codes, password resets) and inbound webhook. Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.