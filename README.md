# YsUp Campus Network

**YsUpCampus.com | The HBCU Network**

YsUp Campus Network is an AI-powered educational platform built for HBCU students. It combines an academic search engine, campus social networking, a gamified learning system, and university tools into one unified experience.

Built with Next.js 14, PostgreSQL, and OpenAI.

---

## Features

### AI-Powered Academic Search Engine

A multi-source search engine with a warm wood/amber themed interface. All searches run in parallel for fast results, and tab switching filters cached results instantly.

- **Books** - Google Books API integration with interactive 3D blue-themed carousel and styled book covers
- **Amazon Books** - Book search with ISBN-based Amazon.com purchase links, star ratings, descriptions, and a 3D yellow-themed carousel
- **Dictionary** - Word definitions, phonetics, pronunciation audio, synonyms, antonyms, and etymology via Free Dictionary API
- **Scholarly Articles** - OpenAlex API (240M+ academic works) with 3D emerald-themed journal carousel
- **Web Search** - DuckDuckGo web results
- **Encyclopedia** - Wikipedia article search
- **Campus Users** - Find classmates by name or username
- **AI Overview** - OpenAI-generated topic overviews with database caching
- **AI Summarize** - One-click AI summaries for any search result with database caching

### Dashboard

A personalized student dashboard with:

- **Sticky Notes** - Draggable, persistent notes that save position and content to the database
- **File Manager** - Upload, view, and manage personal files with on-demand data loading
- **Class Networks** - Quick access to joined networks with shared files from classmates
- **YsUp Bluebook Calendar** - Event calendar with month, week, day, and list views
- **Notifications** - Real-time notification bell with 30-second polling

### Class Networks

PostgreSQL-backed social networking for classes, clubs, and organizations:

- Create public or private networks
- Post feed with co-signing and threaded responses
- File sharing across network members (files appear on all members' dashboards)
- Moderator tools for managing members and join requests
- Share networks via SMS, Email, WhatsApp, Instagram, X (Twitter), or link
- Invite links with login redirect for unauthenticated users

### YsUp Bluebook Calendar

A full-featured event and calendar system:

- Month, Week, Day, and List views
- Day view with hourly timeline (6 AM - 11 PM) and current-time indicator
- Selectable day squares (click to highlight, double-click to open Day view)
- 14 rainbow color options for events
- Multi-day event support
- Network-based invitations (invite entire networks or individual members)
- RSVP system (Going / Maybe / Not Going) with real-time tallies
- Howard University academic calendar (79 events) auto-seeded for Howard students
- Notification system for upcoming events

### The Game

A gamified learning system with two modes:

- **In-Person Mode** - Classroom-based game where teachers award YBucks to students by username
- **Online AI Mode** - AI coaching sessions powered by GPT-4o-mini using the Socratic teaching method
  - Chalkboard-style UI
  - AI coach guides students to answers without giving direct solutions
  - 10 YBucks awarded for arriving at the answer
  - 250 YBucks bonus at session end

### Bison Web

A skeuomorphic Howard.edu magazine browser:

- Open two-page magazine design on a wooden desk background
- 8 content sections: Home, News, Academics, Admissions, Campus Life, Events, Research, Legacy
- Content mirrors real howard.edu website data
- Page slide transitions with parchment textures
- Mobile responsive with vertical stacking

### The Hilltop

A campus newspaper viewer:

- PDF.js-powered newspaper reader with amber/parchment aesthetic
- Page navigation with clickable page numbers
- Admin mode for Editor-in-Chief to upload new editions
- Download button for current PDF

### Additional Features

- **Bookstore** - Virtual campus bookstore
- **Academy** - Educational content library
- **Bulletin Board** - Campus-wide announcements
- **Onboarding** - 12-step guided setup wizard for new students with Honor Code agreement
- **Notifications** - Real-time notification system with YBucks earned alerts and event invites

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Database | PostgreSQL |
| AI | OpenAI GPT-4o-mini |
| Auth | Server actions with bcryptjs password hashing |
| PDF Viewer | PDF.js v3.11.174 |
| Package Manager | pnpm |

---

## Project Structure

```
app/
  api/
    books/              # Google Books API
    amazon-books/       # Amazon Books search
    dictionary/         # Word definitions and phonetics
    scholar/            # OpenAlex scholarly articles
    wiki/               # Wikipedia search
    web-search/         # DuckDuckGo web search
    search-users/       # Campus user search
    ai-overview/        # OpenAI topic overviews
    summarize/          # OpenAI summaries
    book-image/         # Book cover image proxy
    networks/           # Class Networks CRUD, posts, files
    events/             # Calendar events, RSVP, invites
    notes/              # Sticky notes CRUD
    files/              # File upload/download
    notifications/      # Notification system
    game/
      online/           # AI coaching sessions
      inperson/         # In-person game awards
  actions/
    auth.ts             # Authentication server actions
  search/               # Search engine page
  dashboard/            # Student dashboard
  networks/[slug]/      # Network detail pages
  invite/network/[slug]/ # Network invite handler
  game/online/[sessionId]/ # AI chalkboard page
  bison-homepage/       # Bison Web magazine browser
  hilltop/              # Campus newspaper viewer
  onboarding/           # New student setup wizard
components/             # Shared React components
lib/
  db.ts                 # PostgreSQL connection pool
public/                 # Static assets and images
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts with YBucks balance |
| `class_networks` | Networks for classes/clubs/organizations |
| `network_members` | Network membership tracking |
| `network_join_requests` | Private network join requests |
| `network_posts` | Posts within networks |
| `network_post_responses` | Threaded responses to posts |
| `network_shared_files` | Files shared within networks |
| `calendar_events` | Events with color, location, and date ranges |
| `event_invites` | Event invitations with RSVP status |
| `user_sticky_notes` | Dashboard sticky notes with position data |
| `user_files` | Uploaded files with metadata |
| `game_sessions` | Game session tracking |
| `game_session_players` | Players in game sessions |
| `game_chat_messages` | AI coaching chat history |
| `game_ybucks_awards` | YBucks award records |
| `notifications` | User notifications |
| `ai_cache` | Cached AI-generated summaries and overviews |

---

## API Routes (19 Total)

**Search (9):** Books, Amazon Books, Dictionary, Scholarly Articles, Web, Encyclopedia, Campus Users, AI Overview, AI Summarize

**Social (3):** Class Networks, Network Files, Shared Files

**Calendar (1):** Events with RSVP, invites, and seeding

**Dashboard (3):** Sticky Notes, Files, Notifications

**Game (2):** Online AI Coaching, In-Person Awards

**Utility (1):** Book Image Proxy

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key
- pnpm package manager

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm next dev --turbo -H 0.0.0.0 -p 5000
```

### Production Build

```bash
pnpm build
pnpm start
```

---

## External APIs

| Service | Purpose |
|---------|---------|
| Google Books API | Book search data and ISBNs |
| Free Dictionary API | Word definitions, phonetics, and pronunciation |
| OpenAlex API | Scholarly article search (240M+ works) |
| Wikipedia API | Encyclopedia article search |
| DuckDuckGo | Web search results |
| OpenAI (GPT-4o-mini) | AI overviews, summaries, and game coaching |

---

## Design

- Wood/amber themed UI throughout
- 3D interactive carousels for books and journals
- Skeuomorphic design elements (magazine browser, chalkboard, newspaper)
- Full mobile responsiveness with hamburger menu navigation
- Horizontal scrollable category tabs on mobile search
- Accessible navigation with ARIA labels

---

## Supported HBCUs

The platform includes all 100+ Historically Black Colleges and Universities in its signup dropdown, with university-specific features available for Howard University students (academic calendar, Bison Web, The Hilltop).

---

**Created by Najee "Naww G" Jeremiah**
