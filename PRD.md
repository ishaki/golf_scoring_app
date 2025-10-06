# Product Requirements Document (PRD)
## Golf Scoring System

**Version:** 2.1
**Date:** October 4, 2025 (Updated with Flexible Players, Google Auth & Eagle Scoring)
**Tech Stack:** React + Vite + TailwindCSS + Zustand + Supabase

---

## 1. Executive Summary

### 1.1 Purpose
A mobile-first web application for calculating and tracking custom golf scoring for 3-6 player groups, featuring a unique point-based system with "voor" (handicap stroke) mechanics and eagle-tier scoring.

### 1.2 Goals
- Enable fast, mobile-optimized hole-by-hole score entry
- Automatically calculate points based on custom scoring rules with eagle tier
- Provide detailed dashboard analytics and transaction breakdowns
- Allow users to create and manage custom golf courses
- Support 9-hole and 18-hole course configurations
- Enable mixing of two 9-hole courses to create full 18-hole rounds
- **NEW V2:** Multi-user support with cloud database (Supabase)
- **NEW V2:** User authentication with email verification and Google OAuth
- **NEW V2:** Public live score sharing for spectators
- **NEW V2:** Personal game history for registered users
- **NEW V2:** Real-time score updates for live viewing
- **NEW V2.1:** Flexible player count (3-6 players instead of fixed 6)

### 1.3 Target Users
- **Primary:** Registered golfers playing in groups of 3-6 players
- **Secondary:** Spectators/friends viewing live scores (no registration required)
- Users familiar with match play and handicap systems
- Mobile device users (primary interface)

---

## 2. Core Scoring Rules

### 2.1 Point System **UPDATED V2.1**
Points are calculated **per hole** based on relative performance against all other players:

#### Eagle or Better (≤ -2 vs par) **NEW**
- **Gains:** +4 points from each player who scored worse
- **Gains:** 0 points from players who scored the same (eagle or better)
- **Loses:** 0 points (best possible score tier)

#### Birdie (-1 vs par)
- **Gains:** +2 points from each player who scored worse
- **Gains:** 0 points from players who also scored birdie
- **Loses:** -4 points to each player who scored eagle or better **UPDATED**

#### Par (0 vs par)
- **Gains:** +1 point from each player who scored worse than par
- **Gains:** 0 points from players who also scored par
- **Loses:** -2 points to each player who scored birdie
- **Loses:** -4 points to each player who scored eagle or better **UPDATED**

#### Bogey (+1 vs par)
- **Gains:** +1 point from each player who scored worse than bogey
- **Gains:** 0 points from players who also scored bogey
- **Loses:** -1 point to each player who scored par
- **Loses:** -2 points to each player who scored birdie
- **Loses:** -4 points to each player who scored eagle or better **UPDATED**

#### Double Bogey or Worse (≥ +2 vs par)
- **Gains:** +1 point from each player who scored worse
- **Gains:** 0 points from players who scored the same
- **Loses:** -1 point to each player who scored bogey
- **Loses:** -1 point to each player who scored par
- **Loses:** -2 points to each player who scored birdie
- **Loses:** -4 points to each player who scored eagle or better **UPDATED**

### 2.2 Voor (Handicap Strokes) System

#### Definition
- "Voor" = handicap strokes given from stronger player to weaker player
- Example: Player A gives 2 strokes voor to Player B

#### Stroke Allocation
- Strokes are applied to holes based on **Stroke Index** (1-18)
- Lower stroke index = harder hole
- If Player B receives 2 strokes, they apply to the 2 lowest index holes (e.g., index 1 and 2)

#### Net Score Calculation
- On designated stroke holes: **Net Score = Gross Score - 1**
- Example: Player B scores 5 (bogey) on stroke hole → Net score = 4 (par)

#### Tie-Breaking with Voor
- If net scores are tied on a stroke hole, the player receiving the stroke **wins**
- Example:
  - Hole: Par 4, Stroke Index 1
  - Player A (no stroke): 4 (par)
  - Player B (gets stroke): 4 (gross) → 3 (net par beating net bogey)
  - Result: Player B is treated as having beaten Player A (net par vs net bogey concept)

**Clarification:** When net scores tie on a stroke hole, treat the receiving player as one stroke better for point calculation purposes.

---

## 3. Functional Requirements

### 3.0 Authentication & User Management **NEW V2**

#### FR-0.1: User Registration
- **Requirements:**
  - Email address (required, unique)
  - Password (minimum 8 characters)
  - Display name (for showing in games)
- **Process:**
  - User submits registration form
  - Supabase sends verification email
  - User clicks verification link
  - Account activated
- **UI:**
  - Registration form on landing page
  - "Sign Up" button
  - Email verification pending screen
  - Resend verification email option

#### FR-0.2: User Login **UPDATED V2.1**
- **Methods:**
  - Email + Password
  - **Google OAuth (Sign in with Google)** **NEW**
  - Magic link (email-based passwordless login)
- **Flow:**
  - Login form with email/password or Google button
  - Supabase authentication (supports OAuth providers)
  - Redirect to home/dashboard
  - Session management (remember me)
- **Security:**
  - Rate limiting on login attempts
  - Password reset functionality
  - Secure session tokens
  - OAuth token validation

#### FR-0.3: Email Verification
- **Requirement:** Users MUST verify email before creating games
- **Enforcement:**
  - Block "New Game" button if email unverified
  - Show verification status on profile
  - Send reminder emails (optional)
- **UI Indicators:**
  - ⚠️ "Please verify your email" banner
  - ✓ "Email verified" badge

#### FR-0.4: User Profile
- **Display:**
  - Display name (editable)
  - Email address (verified badge)
  - Account created date
  - Total games played
- **Actions:**
  - Edit display name
  - Change password
  - Delete account (with confirmation)
  - Logout

### 3.1 Game Setup Flow

#### FR-1.1: Player Configuration **UPDATED V2.1**
- **Input:** Names for 3-6 players (flexible count) **UPDATED**
- **Player Count Selection:**
  - Dropdown or buttons: "3 players", "4 players", "5 players", "6 players"
  - Dynamically show/hide input fields based on selection
- **Options:**
  - Select from registered users (autocomplete)
  - Enter custom names for non-registered players
- **Validation:** All names required, no duplicates, minimum 3 players, maximum 6
- **UI:** Simple text input fields with user search, mobile-optimized
- **Game Creator:** Must be authenticated and email-verified

#### FR-1.2: Voor (Handicap) Allocation **UPDATED V2.1**
- **Input Method:** Each player can give strokes to other players
- **UI Options:**
  - Matrix view: Dynamic NxN grid (3x3 to 6x6) based on player count **UPDATED**
  - Or sequential: "How many strokes does Player A give to Player B?"
- **Validation:**
  - Strokes must be 0-18
  - Reciprocal strokes not allowed (if A gives B strokes, B cannot give A)
- **Auto-calculation:** System determines which holes receive strokes based on stroke index

#### FR-1.3: Course Management System **NEW**

##### Course Creation
- **Course Properties:**
  - Course Name (required, unique)
  - Course Type: 9-hole or 18-hole
  - Per Hole Configuration:
    - Hole Number (1-9 or 1-18)
    - Stroke Index (1-9 or 1-18, must be unique within course)
    - Par (3, 4, or 5)

- **UI Requirements:**
  - Course creation form (accessed from Home or Settings)
  - Table/grid view for hole-by-hole configuration
  - Save button to persist course to localStorage
  - Validation: All fields required, no duplicate stroke indexes

##### Course Selection During Game Setup
- **Selection UI:**
  - Dropdown or list showing all saved courses
  - If 9-hole course selected for "Front 9":
    - Second dropdown appears for "Back 9" selection
    - Only other 9-hole courses available
    - Combined to form complete 18-hole game
  - If 18-hole course selected:
    - No second selection needed
    - Use course as-is

- **Default Courses:**
  - System includes 3 pre-installed 18-hole courses:
    - Standard Par 72
    - Executive Course
    - Championship Course

##### Course CRUD Operations
- **Create:** Add new course with all hole details
- **Read:** View list of saved courses
- **Update:** Edit existing course details (future enhancement)
- **Delete:** Remove course from storage (with confirmation)

#### FR-1.4: Course Storage
- **LocalStorage Schema:**
  ```javascript
  {
    id: "uuid",
    name: "Pebble Beach Front 9",
    type: "9-hole" | "18-hole",
    holes: [
      { number: 1, strokeIndex: 5, par: 4 },
      { number: 2, strokeIndex: 11, par: 4 },
      // ... up to 9 or 18 holes
    ],
    createdAt: "ISO timestamp",
    isDefault: false  // true for system presets
  }
  ```

### 3.2 Scoring Interface (Mobile-First)

#### FR-2.1: Hole-by-Hole Input
- **Display:**
  - Current hole number (1-18)
  - Hole par value
  - Stroke indicators: Show which players get voor on this hole
- **Input:**
  - 6 input fields (one per player) for gross scores
  - Large touch targets (min 44x44px)
  - Numeric keyboard on mobile
- **Visual Feedback:**
  - Color coding: Birdie (green), Par (blue), Bogey (yellow), Worse (red)
  - Real-time point preview (optional)

#### FR-2.2: Navigation
- **Next/Previous Hole:** Large buttons
- **Hole Selector:** Quick jump to any hole (1-18 grid or dropdown)
- **Progress Indicator:** Show completion (e.g., "Hole 7 of 18")

#### FR-2.3: Score Validation
- **Range Check:** Scores between 1-15 (reasonable golf scores)
- **Warning:** Alert if score seems unusual (e.g., hole-in-one on par 5)
- **Edit Mode:** Allow correction of previously entered holes

### 3.3 Points Calculation Engine

#### FR-3.1: Net Score Calculation
```javascript
For each player on each hole:
  1. Start with gross score
  2. If player receives stroke on this hole (based on voor allocation):
     - Net score = Gross score - 1
  3. Else:
     - Net score = Gross score
```

#### FR-3.2: Point Calculation Algorithm **UPDATED V2.1**
```javascript
For each player on each hole:
  1. Calculate net scores for comparison (gross score - voor strokes)
  2. For each opponent (N-1 opponents, where N = 3-6 players):
     a. Compare net scores to determine winner
     b. Award points based on WINNER'S GROSS SCORE vs par:
        - If player did better (lower net score):
          * Player's gross is Eagle or better (≤-2 vs par): +4 points **NEW**
          * Player's gross is Birdie (-1 vs par): +2 points
          * Player's gross is Par (0 vs par): +1 point
          * Player's gross is Bogey or worse (≥+1 vs par): +1 point
        - If player did worse (higher net score):
          * Opponent's gross is Eagle or better: -4 points **NEW**
          * Opponent's gross is Birdie: -2 points
          * Opponent's gross is Par: -1 point
          * Opponent's gross is Bogey or worse: -1 point
        - If same net score:
          * On stroke hole where only one player receives stroke: receiving player wins
            (points based on receiving player's GROSS score vs par)
          * Otherwise: 0 points (true tie)
  3. Sum all points from all opponents (3-6 players total)

IMPORTANT: Net scores determine WHO wins, Gross scores determine HOW MANY points.
```

#### FR-3.3: Running Totals
- Calculate cumulative points after each hole
- Store per-hole breakdown for analytics

### 3.4 Live Score Sharing **NEW V2**

#### FR-3.5: Generate Shareable Link
- **Trigger:** Game creator clicks "Share Live Scores" button
- **Generation:**
  - Create unique public game URL: `/live/{gameId}`
  - gameId is UUID, non-guessable
  - Copy link to clipboard
- **Sharing Methods:**
  - Copy link button
  - QR code display (for easy mobile sharing)
  - Share via social media (optional)
- **UI:**
  - "Share" button on game screen
  - Share modal with link and QR code
  - "Copied!" confirmation

#### FR-3.6: Public Live View (No Authentication Required)
- **Access:**
  - Anyone with link can view
  - No login/registration required
  - Read-only access
- **Display:**
  - Real-time leaderboard
  - Current hole progress
  - Score updates as they happen
  - Player names and points
- **Restrictions:**
  - Cannot edit scores
  - Cannot see voor configuration details (privacy)
  - Cannot see player email addresses
  - Auto-refresh every 10 seconds
- **UI:**
  - Clean, spectator-friendly dashboard
  - "This is a live view" banner
  - Last updated timestamp
  - Mobile-optimized

#### FR-3.7: Real-Time Updates
- **Technology:** Supabase Realtime subscriptions
- **Behavior:**
  - Spectators see updates within 2-3 seconds
  - No manual refresh needed
  - WebSocket connection for live data
- **Fallback:**
  - Polling every 10s if WebSocket fails
  - Show connection status indicator

### 3.5 Dashboard & Analytics

#### FR-4.1: Real-Time Scoreboard **UPDATED V2**
- **Display:**
  - Player names sorted by total points (highest first)
  - Current total points per player
  - Position/rank (1st, 2nd, etc.)
- **Update:** Live update as scores are entered (real-time via Supabase)
- **Mobile View:** Compact table, swipeable
- **Access Control:**
  - Game creator: Full access
  - Registered users in game: Full access
  - Public viewers (via share link): Read-only access

#### FR-4.2: Hole-by-Hole Breakdown
- **Table View:**
  - Rows: Players
  - Columns: Holes (1-18) + Total
  - Cells: Points earned per hole (color-coded)
- **Summary Stats:**
  - Gross scores per hole
  - Net scores per hole (with voor indicators)
  - Points per hole

#### FR-4.3: Transaction Breakdown
- **Player vs Player Matrix:**
  - 6x6 grid showing point exchanges
  - Example: Cell [A,B] shows how many points A gained/lost from B
- **Detailed View:**
  - Expandable: Click to see hole-by-hole transactions between two players
- **Visual:** Heatmap colors (green = gained, red = lost)

#### FR-4.4: Game Summary (Final Screen)
- **Winner Announcement:** Highlight player with most points
- **Statistics:**
  - Total birdies, pars, bogeys per player
  - Best hole (most points gained)
  - Worst hole (most points lost)
  - Head-to-head records
- **Chart/Graph:** Point progression over 18 holes (line chart)

### 3.6 Data Persistence **UPDATED V2**

#### FR-5.1: Auto-Save (Supabase Cloud Storage)
- Save game state after each hole entry
- Store in Supabase database (not localStorage)
- Real-time sync to cloud
- Automatic conflict resolution

#### FR-5.2: Load Game
- On app launch: Check Supabase for incomplete games
- Prompt: "Continue previous game or start new?"
- Resume from last completed hole
- Support multiple devices (cloud sync)

#### FR-5.3: Game History (Registered Users Only) **UPDATED V2**
- **Storage:** Supabase database with user_id association
- **Access Control:**
  - Only registered, logged-in users can see history
  - Users only see their own games (where they were creator or participant)
  - Games are private by default
- **List View:** Show past games (date, players, winner, course)
- **Detail View:** Load historical game data (read-only)
- **Search/Filter:**
  - Filter by date range
  - Filter by course
  - Search by player name
- **No Limit:** Store unlimited games in cloud

#### FR-5.4: Data Migration **NEW V2**
- **Migration Tool:**
  - One-time migration from localStorage to Supabase
  - Preserve existing game history
  - Preserve custom courses
- **Process:**
  - User logs in for first time
  - System detects localStorage data
  - Prompt: "Import your local data to cloud?"
  - Migrate courses and game history
  - Clear localStorage after successful migration

#### FR-5.5: Export (Optional)
- **CSV Export:** Download game data as CSV
- **PDF Scorecard:** Generate printable scorecard

---

## 4. Non-Functional Requirements

### 4.1 Performance **UPDATED V2**
- **Load Time:** < 2 seconds on 3G connection
- **Input Responsiveness:** < 100ms delay on score entry
- **Calculation Speed:** Points calculated instantly (< 50ms)
- **Real-time Latency:** < 3 seconds for live score updates
- **Database Queries:** < 500ms for game data retrieval

### 4.2 Compatibility
- **Browsers:** Chrome, Safari, Firefox, Edge (latest 2 versions)
- **Mobile OS:** iOS 14+, Android 10+
- **Screen Sizes:** 320px - 428px (mobile), 768px+ (tablet/desktop)

### 4.3 Offline Support **UPDATED V2**
- **Limited Offline:** Scoring continues offline, syncs when online
- **Data:** All calculations client-side (no server required)
- **Sync:** Automatic background sync when connection restored

### 4.4 Security **NEW V2**
- **Authentication:** Supabase Auth with JWT tokens
- **Row-Level Security (RLS):** Database policies enforce access control
- **Privacy:**
  - Users can only access their own games
  - Public games readable via share link only
  - Email addresses never exposed in public views
- **Rate Limiting:**
  - Login attempts: 5 per 15 minutes
  - API calls: 100 per minute per user
- **Data Encryption:** SSL/TLS for all data transfer

### 4.5 Accessibility
- **Touch Targets:** Minimum 44x44px
- **Contrast:** WCAG AA compliance
- **Font Size:** Minimum 16px for body text

---

## 5. User Interface Specifications

### 5.1 Mobile Scoring Screen (Primary View)
```
┌─────────────────────────────┐
│  Hole 7 • Par 4  [Menu]     │
├─────────────────────────────┤
│                             │
│  Voor: ★ Alice, ★ Bob       │  ← Stroke indicators
│                             │
│  Player    Score   Points   │
│  ────────────────────────   │
│  Alice★    [ 4 ]    +3      │
│  Bob★      [ 5 ]    -1      │
│  Carol     [ 4 ]    +1      │
│  David     [ 6 ]    -5      │
│  Emma      [ 4 ]    +1      │
│  Frank     [ 5 ]    -2      │
│                             │
│  [← Prev]  [7/18]  [Next →] │
│                             │
│  [View Dashboard]           │
└─────────────────────────────┘
```

### 5.2 Dashboard Screen (Desktop/Tablet)
```
┌──────────────────────────────────────────────────┐
│  Golf Scoring Dashboard          [New Game]      │
├──────────────────────────────────────────────────┤
│                                                  │
│  Leaderboard          │  Hole-by-Hole           │
│  ─────────────────    │  ──────────────         │
│  1. Alice    +24      │  [Table: Holes 1-18]    │
│  2. Carol    +12      │                         │
│  3. Bob      +8       │                         │
│  4. Frank    -5       │                         │
│  5. Emma     -10      │                         │
│  6. David    -15      │                         │
│                       │                         │
├───────────────────────┴─────────────────────────┤
│  Transaction Matrix                              │
│  [6x6 Heatmap showing point exchanges]          │
└──────────────────────────────────────────────────┘
```

### 5.3 Color Scheme (TailwindCSS) **UPDATED V2.1**
- **Primary:** Blue-600 (buttons, headers)
- **Eagle or Better:** Emerald-600 **NEW**
- **Birdie:** Green-500
- **Par:** Blue-400
- **Bogey:** Yellow-500
- **Double Bogey+:** Red-500
- **Background:** Gray-50 (light), Gray-900 (dark mode)

---

## 6. Data Models

### 6.1 User Model **NEW V2**
```typescript
interface User {
  id: string;              // uuid (from Supabase Auth)
  email: string;           // unique, verified
  display_name: string;    // user's chosen name
  email_verified: boolean; // true after email confirmation
  created_at: string;      // ISO timestamp
  games_played: number;    // count of completed games
}
```

### 6.2 Course Model **UPDATED V2**
```typescript
interface Course {
  id: string;              // uuid
  user_id: string | null;  // null for default courses, user_id for custom
  name: string;            // "Pebble Beach Front 9"
  type: "9-hole" | "18-hole";
  holes: CourseHole[];     // 9 or 18 holes (JSONB in Supabase)
  created_at: string;      // ISO timestamp
  is_default: boolean;     // true for system presets
  is_public: boolean;      // allow other users to see this course
}

interface CourseHole {
  number: number;          // 1-9 or 1-18
  strokeIndex: number;     // 1-9 or 1-18 (difficulty ranking)
  par: 3 | 4 | 5;
}
```

### 6.3 Player Model
```typescript
interface Player {
  id: string;           // uuid
  name: string;
  user_id: string | null;  // link to User if registered player
  voorGiven: {          // strokes given TO other players
    [playerId: string]: number;  // playerId: strokes
  };
  strokeHoles: number[];  // hole numbers where player RECEIVES strokes
}
```

### 6.4 Hole Model
```typescript
interface Hole {
  number: number;       // 1-18
  par: number;          // 3-5
  strokeIndex: number;  // 1-18 (difficulty ranking)
  scores: {
    [playerId: string]: number;  // gross score
  };
  netScores: {
    [playerId: string]: number;  // net score (after voor)
  };
  points: {
    [playerId: string]: number;  // points earned this hole
  };
}
```

### 6.5 Game Model **UPDATED V2**
```typescript
interface Game {
  id: string;              // uuid
  created_by: string;      // user_id of game creator
  created_at: string;      // ISO timestamp
  updated_at: string;      // last update timestamp
  players: Player[];       // JSONB in Supabase
  holes: Hole[];           // JSONB in Supabase
  current_hole: number;    // 1-18
  is_complete: boolean;
  is_public: boolean;      // true if shareable link enabled
  public_token: string | null;  // UUID for public access URL
  course_id: string;       // reference to Course
  course_name: string;     // denormalized for display
  totals: {
    [playerId: string]: number;  // cumulative points
  };
}
```

### 6.6 Supabase Database Schema **NEW V2**

#### Tables:

**users** (managed by Supabase Auth)
```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**profiles** (extends auth.users)
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**courses**
```sql
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('9-hole', '18-hole')),
  holes JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**games**
```sql
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id),
  course_name TEXT NOT NULL,
  players JSONB NOT NULL,
  holes JSONB NOT NULL,
  current_hole INTEGER DEFAULT 1 CHECK (current_hole BETWEEN 1 AND 18),
  is_complete BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  public_token UUID UNIQUE,
  totals JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Row-Level Security (RLS) Policies:

**courses table:**
- Users can read: their own courses + default courses + public courses
- Users can insert: their own courses only
- Users can update: their own courses only (not defaults)
- Users can delete: their own courses only (not defaults)

**games table:**
- Users can read: games they created
- Anyone with public_token can read: games where is_public = true
- Users can insert: new games (must be authenticated + email verified)
- Users can update: games they created (and game not complete)
- Users can delete: games they created

### 6.7 LocalStorage Schema (Legacy - for migration)
```javascript
// DEPRECATED: Will be migrated to Supabase on first login

// Current active game
localStorage.setItem('golf-scoring:current-game', JSON.stringify(game));

// Game history
localStorage.setItem('golf-scoring:history', JSON.stringify([...]));

// Saved courses
localStorage.setItem('golf-scoring:courses', JSON.stringify([...]));

// App settings (still used for UI preferences)
localStorage.setItem('golf-scoring:settings', JSON.stringify({
  theme: 'light'
}));
```

---

## 7. Technical Architecture

### 7.1 Tech Stack **UPDATED V2**
- **Framework:** React 18
- **Build Tool:** Vite 5
- **Styling:** TailwindCSS 3
- **State Management:** Zustand
- **Routing:** React Router v6
- **Backend:** Supabase (PostgreSQL + Realtime + Auth)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Database (PostgreSQL with RLS)
- **Real-time:** Supabase Realtime (WebSocket subscriptions)
- **Deployment:** Vercel / Netlify (frontend) + Supabase (backend)

### 7.2 Project Structure
```
golf-scoring-app/
├── src/
│   ├── components/
│   │   ├── setup/
│   │   │   ├── PlayerSetup.jsx
│   │   │   ├── VoorConfiguration.jsx
│   │   │   └── CourseSetup.jsx
│   │   ├── courses/            **NEW**
│   │   │   ├── CourseList.jsx
│   │   │   ├── CourseForm.jsx
│   │   │   └── HoleEditor.jsx
│   │   ├── scoring/
│   │   │   ├── HoleInput.jsx
│   │   │   ├── ScoreCard.jsx
│   │   │   └── Navigation.jsx
│   │   ├── dashboard/
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── HoleBreakdown.jsx
│   │   │   ├── TransactionMatrix.jsx
│   │   │   └── GameSummary.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       └── Input.jsx
│   ├── store/
│   │   ├── gameStore.js        // Zustand store
│   │   └── courseStore.js      **NEW**
│   ├── utils/
│   │   ├── scoring.js          // Points calculation logic
│   │   ├── storage.js          // localStorage utilities
│   │   ├── courseStorage.js    **NEW**
│   │   └── validation.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Setup.jsx
│   │   ├── Game.jsx
│   │   ├── Dashboard.jsx
│   │   └── Courses.jsx         **NEW**
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

### 7.3 State Management (Zustand)
```javascript
// gameStore.js
import create from 'zustand';

const useGameStore = create((set) => ({
  game: null,

  // Actions
  createGame: (players) => set({ game: initializeGame(players) }),
  updateScore: (holeNumber, playerId, score) => set((state) => ({
    game: {
      ...state.game,
      holes: updateHoleScore(state.game.holes, holeNumber, playerId, score)
    }
  })),
  calculatePoints: () => set((state) => ({
    game: calculateAllPoints(state.game)
  })),
  saveGame: () => {
    // localStorage save logic
  },
  loadGame: () => {
    // localStorage load logic
  }
}));
```

---

## 8. Development Phases

### Phase 1: Foundation (Days 1-2)
- ✅ Setup React + Vite + TailwindCSS
- ✅ Configure Zustand
- ✅ Create project structure
- ✅ Build data models and storage utilities

### Phase 2: Game Setup (Day 2)
- Player name input
- Voor allocation interface
- Course configuration

### Phase 3: Scoring Interface (Days 3-4)
- Hole-by-hole input UI
- Navigation controls
- Score validation

### Phase 4: Calculation Engine (Day 4)
- Net score calculation with voor
- Points calculation algorithm
- Running totals

### Phase 5: Dashboard (Day 5)
- Leaderboard
- Hole-by-hole breakdown
- Transaction matrix
- Game summary

### Phase 6: Persistence & Polish (Day 6)
- LocalStorage integration
- Game history
- UI/UX refinements
- Mobile responsiveness testing

### Phase 7: Testing & Deployment (Day 7)
- Score calculation testing
- Edge case validation
- Deploy to Vercel/Netlify

---

## 9. Success Metrics

### 9.1 User Experience
- **Task Completion:** Users can complete 18-hole scoring in < 10 minutes
- **Error Rate:** < 5% score entry errors requiring correction
- **Mobile Usability:** 90%+ of users prefer mobile interface

### 9.2 Technical
- **Performance:** Lighthouse score > 90
- **Bundle Size:** < 200KB gzipped
- **Uptime:** 99.9% (static hosting)

---

## 10. Future Enhancements (Post-MVP)

### V2 Features
- Cloud sync with Supabase/Firebase
- Multi-game formats (stroke play, Stableford)
- Player profiles and handicap tracking
- Social features (share games, leaderboards)
- PWA with offline support
- Push notifications for turn reminders

### V3 Features
- Live multiplayer (real-time scoring)
- Course database integration (public courses)
- GPS integration (auto-detect hole)
- Statistics dashboard (seasonal trends)

---

## 11. Open Questions & Decisions

### Q1: Voor Reciprocity
- **Question:** Can Player A give strokes to B, while B gives strokes to A?
- **Decision:** No - only one-way voor relationships (confirmed)

### Q2: Score > Double Bogey
- **Question:** How are scores worse than double bogey handled?
- **Assumed Rule:** Continue -1 pattern (triple bogey = -1 from bogey, etc.)

### Q3: Course Selection
- **Question:** Support multiple courses or single custom setup?
- **Decision:** Single custom setup for MVP, course library in V2

---

## 12. Appendix

### A. Scoring Examples

#### Example 1: Simple Hole (No Voor)
- Hole 5, Par 4, Stroke Index 10
- Scores: Alice=3 (birdie), Bob=4 (par), Carol=4 (par), David=5 (bogey), Emma=6 (double), Frank=4 (par)

**Points Calculation:**
- Alice (birdie): +2 from Bob, Carol, David, Emma, Frank = **+10 points**
- Bob (par): -2 from Alice, 0 from Carol/Frank, +1 from David, +1 from Emma = **0 points**
- Carol (par): -2 from Alice, 0 from Bob/Frank, +1 from David, +1 from Emma = **0 points**
- David (bogey): -2 from Alice, -1 from Bob/Carol/Frank, +1 from Emma = **-6 points**
- Emma (double): -2 from Alice, -1 from Bob/Carol/Frank, -1 from David = **-8 points**
- Frank (par): -2 from Alice, 0 from Bob/Carol, +1 from David, +1 from Emma = **0 points**

**Total: +10 + 0 + 0 - 6 - 8 + 0 = -4** ❌ (Should be 0 - need to verify rule interpretation)

#### Example 2: With Voor
- Hole 1, Par 4, Stroke Index 1
- Alice gives 2 strokes to Bob (so Bob gets stroke on holes with index 1 and 2)
- Scores: Alice=4 (gross), Bob=4 (gross) → 3 (net)

**Points Calculation:**
- Alice: Net score = 4 (no voor)
- Bob: Net score = 3 (4 gross - 1 voor stroke)
- Bob's net score (3) beats Alice's net score (4)
- Points awarded based on Bob's GROSS score vs par: 4 - 4 = 0 (par)
- Par = 1 point when winning
- Bob: +1 point from Alice (won with par)
- Alice: -1 point from Bob (lost to par)

---

**Document Status:** ✅ Approved
**Next Steps:** Begin Phase 1 implementation
