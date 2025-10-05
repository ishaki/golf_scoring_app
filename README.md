# Golf Scoring App

A modern, cloud-based golf scoring application built with React and Supabase. Track your golf games, manage courses, calculate scores with handicaps, and keep a history of all your rounds.

## Features

- ⛳ **Game Management**: Create and track golf games with multiple players
- 📊 **Score Tracking**: Real-time score entry with automatic calculations
- 🏌️ **Handicap System**: Support for player handicaps and "voor" (stroke allocation)
- 🏆 **Leaderboard**: Live standings and point calculations
- 📝 **Course Management**: Create custom courses (9-hole or 18-hole)
- 📈 **Game History**: View past games with detailed scorecards
- 🔐 **User Authentication**: Secure login with email verification
- ☁️ **Cloud Sync**: Access your data from any device
- 💾 **Auto-Resume**: Never lose progress - resume games after closing browser
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Authentication, Row Level Security)
- **State Management**: Zustand
- **Routing**: React Router v7

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works great)

### Installation

1. **Clone the repository**
   ```bash
   cd golf-scoring-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   Follow the detailed guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)

   Quick version:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema-clean.sql`
   - Get your Project URL and anon key from Settings → API

4. **Configure environment variables**

   Create `.env.local` in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:5173`

## Usage

### First Time Setup

1. **Sign Up**: Create an account with your email
2. **Verify Email**: Click the link sent to your email
3. **Start Playing**: Create your first game or explore courses

### Creating a Game

1. Go to **Setup** page
2. Add players with their names and handicaps
3. Select a course (or use default)
4. Configure "voor" settings if needed
5. Click **Start Game**

### During the Game

1. Enter scores for each player on each hole
2. View live leaderboard and standings
3. Navigate between holes using arrow buttons
4. Scores auto-save to the cloud

### After the Game

1. Complete the final hole
2. View the dashboard with full breakdown
3. Game automatically saves to history
4. Access it anytime from **History** page

### Resume Game (If Interrupted)

**If you accidentally close the browser during a game**:

1. **Reopen the app** and go to Home page
2. **See the orange "Game In Progress" banner**
3. Click **"Resume Game"**
4. **Continue exactly where you left off**

All scores are auto-saved to Supabase, so you'll never lose progress! Works across devices too - start on your phone, continue on your computer.

See [`RESUME_GAME_FEATURE.md`](./RESUME_GAME_FEATURE.md) for detailed documentation.

## Project Structure

```
golf-scoring-app/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── auth/           # Authentication components
│   │   ├── courses/        # Course management
│   │   ├── dashboard/      # Game results & stats
│   │   ├── scoring/        # Score entry components
│   │   └── setup/          # Game setup components
│   ├── pages/              # Top-level page components
│   │   ├── Home.jsx
│   │   ├── Setup.jsx
│   │   ├── Game.jsx
│   │   ├── Dashboard.jsx
│   │   ├── History.jsx
│   │   ├── Courses.jsx
│   │   ├── Auth.jsx
│   │   └── Profile.jsx
│   ├── store/              # Zustand state management
│   │   ├── authStore.js
│   │   ├── gameStore.js
│   │   └── courseStore.js
│   ├── utils/              # Utility functions
│   │   ├── supabaseStorage.js      # Game data operations
│   │   ├── supabaseCourseStorage.js # Course data operations
│   │   ├── scoring.js              # Score calculations
│   │   ├── voor.js                 # Handicap logic
│   │   └── validation.js           # Form validation
│   ├── lib/
│   │   └── supabase.js     # Supabase client config
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── supabase-schema-clean.sql  # Database schema
├── SUPABASE_SETUP.md      # Supabase setup guide
├── MIGRATION_GUIDE.md     # Migration from localStorage
└── package.json
```

## Database Schema

The app uses three main tables:

### `profiles`
- User profile information
- Display name, avatar, etc.

### `courses`
- Golf course configurations
- Includes default courses and custom user courses
- Stores hole pars and stroke indexes

### `games`
- Active and completed games
- Player data, scores, totals
- Support for public sharing

All tables use Row Level Security (RLS) to ensure data privacy.

## Scripts

```bash
# Development
npm run dev          # Start dev server with HMR

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Migrating from localStorage

If you were using an older version that stored data in localStorage, see [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md) for instructions on migrating your data to Supabase.

## Configuration

### Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous/public key

### Supabase Configuration

Key settings in Supabase dashboard:

1. **Authentication**:
   - Email confirmation required
   - Password minimum length: 6 characters

2. **Database**:
   - Row Level Security enabled on all tables
   - Automatic backups enabled

3. **API**:
   - Auto-generated REST API
   - Realtime enabled for live updates

## Features in Detail

### Handicap System

The app supports the Dutch "voor" (handicap strokes) system:
- Each player has a handicap (0-54)
- Strokes are allocated based on hole stroke index
- Net scores automatically calculated
- Stableford points awarded based on net score vs par

### Course Management

- Create 9-hole or 18-hole courses
- Set par for each hole (3, 4, or 5)
- Configure stroke index (difficulty rating)
- Combine two 9-hole courses into 18 holes
- Default courses included

### Scoring

- Tap to enter gross scores
- Automatic net score calculation
- Stableford points system
- Live leaderboard updates
- Hole-by-hole breakdown

## Security

- **Authentication**: Supabase Auth with email verification
- **Authorization**: Row Level Security (RLS) policies
- **Data Privacy**: Users can only access their own data
- **Secure Storage**: All sensitive data encrypted at rest

## Performance

- **Optimistic Updates**: UI updates immediately
- **Auto-save**: Changes saved to cloud automatically
- **Efficient Queries**: Indexed database queries
- **Code Splitting**: Lazy loading for faster initial load

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Troubleshooting

### "Missing Supabase environment variables"
Check that `.env.local` exists and contains correct values. Restart dev server.

### "User not authenticated"
Log out and log back in. Verify email is confirmed in Supabase dashboard.

### Data not syncing
Check browser console for errors. Verify internet connection and Supabase project status.

### Build errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

See [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) for more troubleshooting tips.

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Roadmap

- [ ] Offline mode with sync
- [ ] Multi-round tournaments
- [ ] Player statistics and trends
- [ ] Course ratings and reviews
- [ ] Social features (friends, sharing)
- [ ] Export scorecards as PDF
- [ ] Dark mode
- [ ] Multiple scoring formats (stroke play, match play)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- Check documentation in this README
- Review [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
- Open an issue on GitHub
- Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)

## Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Routing by [React Router](https://reactrouter.com/)
- State management by [Zustand](https://github.com/pmndrs/zustand)

---

**Happy Golfing! ⛳**
