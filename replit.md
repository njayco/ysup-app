# YsUp Campus Platform

## Overview
YsUp Campus Network is an HBCU-focused educational platform built with Next.js 14 (App Router). Its core purpose is to provide a comprehensive digital ecosystem for students, featuring an AI-powered academic search engine, a campus social network, a digital bookstore, an academy, a bulletin board, interactive game features with AI coaching, and a messaging system. The platform aims to enhance the academic and social experience for HBCU students.

## User Preferences
- HBCU-focused platform with all 100+ HBCUs in signup dropdown
- Wood/amber themed UI design
- Blue book carousel, emerald journal carousel
- Search categories ordered: Everything, Books, Amazon Books, Dictionary, Scholarly Articles, Web, Encyclopedia, Campus Users

## System Architecture
The platform is built on Next.js 14 with TypeScript, utilizing the App Router for both frontend and backend API routes. Tailwind CSS and shadcn/ui components are used for styling and UI. Authentication is handled via Next.js server actions, PostgreSQL for user storage, and bcryptjs for password hashing, with localStorage for client-side sessions. OpenAI (gpt-4o-mini) is integrated via Replit AI for various AI functionalities like summaries, topic overviews, and AI coaching.

### Core Features:
- **AI-Powered Academic Search Engine**: Integrates Google Books, OpenAlex for scholarly articles, Wikipedia, DuckDuckGo for web search, and campus user search. It includes AI-generated topic overviews and summaries, with all search results cached in PostgreSQL for 24 hours.
- **Campus Social Network (Class Networks)**: PostgreSQL-backed system for creating, joining, and managing class/club/organization networks. Features include post feeds, co-signing, threaded responses, member management, moderator tools, invite links, and shared file uploads.
- **YsUp Bluebook Calendar**: A PostgreSQL-backed event and calendar system. It supports event creation with color coding, multi-day events, network-based invitations with RSVP tracking, and notifications. Specific university academic calendars (e.g., Howard University) can be seeded and automatically applied to relevant users.
- **Skeuomorphic Calculator**: A client-side interactive desktop calculator with full arithmetic, memory functions, and a distinct visual design.
- **Sticky Notes**: Dashboard sticky notes with full persistence, allowing users to create, position, and rotate notes, with content and position saved to PostgreSQL.
- **File Upload**: Dashboard file storage with CRUD operations, saving file metadata and base64 data to PostgreSQL, with lazy loading of file data for performance.
- **The Game (Online AI Coaching)**: Offers an online AI coaching mode where GPT-4o-mini acts as a Socratic coach. It includes a reward system (YBucks) for user engagement in sessions.
- **Notifications System**: Real-time notifications for various events (e.g., YBucks earned, event invites) fetched via polling and displayed in a header dropdown.
- **Bison Web - Howard.edu Magazine Browser**: A skeuomorphic, two-page magazine interface that mirrors content from the real howard.edu website, featuring responsive design and animated page transitions.
- **The Hilltop - Campus Newspaper**: A PDF.js-powered viewer for campus newspapers with a skeuomorphic aesthetic. It includes page navigation and an admin mode for PDF uploads.

### UI/UX and Design:
- **Responsive Design**: All pages are fully mobile-responsive using Tailwind breakpoints, adapting layouts, font sizes, and navigation (e.g., hamburger menu, horizontal scrollable tabs for mobile search categories).
- **Skeuomorphic Elements**: Incorporates skeuomorphic designs for the calculator, Bison Web magazine browser, and The Hilltop newspaper viewer, enhancing visual engagement.
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