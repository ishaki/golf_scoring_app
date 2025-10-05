# Resume Game Feature

## Overview

The Golf Scoring app now includes automatic game resumption! If a user closes the browser during a game, they can easily pick up right where they left off.

## How It Works

### 1. Automatic Saving
Every score entry is automatically saved to Supabase in real-time:
- **When**: After each score is entered
- **What**: All game data (players, scores, current hole, totals)
- **Where**: Supabase `games` table with `is_complete = false`

### 2. Game Detection
The app checks for in-progress games in multiple places:

#### Home Page
- Automatically checks for active games on load
- Shows a prominent **"Game In Progress"** banner if found
- Displays:
  - Course name
  - Player names
  - Current hole number
- Big **"Resume Game"** button to continue

#### Game Page
- Attempts to load game from Supabase if no game in state
- Shows loading spinner while checking
- Redirects to setup if no game found

#### Setup Page
- Warns user if they try to start a new game while one is active
- Provides options:
  - **Resume Game** - Continue the active game
  - **Start New Game Anyway** - Keep both games
  - **Abandon Current Game** - Delete and start fresh
  - **Back to Home** - Cancel

## User Experience Flow

### Scenario: User Accidentally Closes Browser

1. **During Game**:
   - User is playing on hole 7
   - Scores are auto-saved to Supabase
   - Browser accidentally closes or crashes

2. **Reopening App**:
   - User opens app and goes to home page
   - **Orange banner appears** with pulsing animation
   - Shows: "Game In Progress" with game details
   - User clicks **"Resume Game"** button

3. **Game Resumes**:
   - Loads directly to hole 7
   - All previous scores intact
   - Leaderboard shows correct standings
   - User continues playing seamlessly

### Scenario: User Wants to Start New Game

1. **User goes to Setup page**
2. **Warning modal appears**:
   ```
   ⚠️ Game In Progress

   You have an active game on Standard Par 72
   Hole 7 of 18 • 4 players

   [Resume Game]
   [Start New Game Anyway]
   [Abandon Current Game]
   [Back to Home]
   ```

3. **User has three options**:
   - **Resume**: Go back to the active game
   - **Continue**: Keep the old game and start a new one
   - **Abandon**: Delete the active game permanently

## Technical Implementation

### Database Storage

**Games Table Structure**:
```sql
CREATE TABLE games (
  id UUID PRIMARY KEY,
  created_by UUID REFERENCES auth.users,
  course_name TEXT,
  players JSONB,
  holes JSONB,
  current_hole INTEGER,
  totals JSONB,
  is_complete BOOLEAN DEFAULT FALSE,  -- Key field!
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Query for Active Game**:
```sql
SELECT * FROM games
WHERE created_by = auth.uid()
  AND is_complete = false
ORDER BY created_at DESC
LIMIT 1;
```

### State Management

**gameStore.js**:
```javascript
// Load current game
loadGame: async () => {
  const currentGame = await loadCurrentGame();
  if (currentGame) {
    set({ game: currentGame });
  }
}

// Auto-save on score update
updateScore: async (holeNumber, playerId, score) => {
  // Update state
  const updatedGame = { ...game, /* updates */ };
  set({ game: updatedGame });

  // Save to Supabase
  await saveCurrentGame(updatedGame);
}
```

### Component Logic

**Home.jsx**:
```javascript
useEffect(() => {
  if (user) {
    await loadGame(); // Check for active game
  }
}, [user]);

// Show banner if game exists and not complete
{game && !game.isComplete && (
  <ResumeGameBanner />
)}
```

**Game.jsx**:
```javascript
useEffect(() => {
  if (!game) {
    await loadGame(); // Try to load from Supabase
  }
}, []);
```

## Edge Cases Handled

### Multiple Devices
- **Problem**: User starts game on phone, wants to continue on computer
- **Solution**: Loads most recent incomplete game from Supabase
- **Result**: Works seamlessly across devices

### Multiple Active Games
- **Problem**: User somehow has multiple incomplete games
- **Solution**: Loads the most recent one (ORDER BY created_at DESC LIMIT 1)
- **Note**: Other games remain in database

### Network Failure During Save
- **Problem**: Score entered but save fails
- **Solution**:
  - State is updated immediately (optimistic update)
  - Next successful save will include all changes
  - User can continue playing offline (if we add offline mode)

### Game Completed
- **Problem**: User completes game, what happens?
- **Solution**:
  - Game is marked `is_complete = true`
  - No longer shows in "resume game" flow
  - Appears in history instead
  - Can view but not edit

### Abandoned Games
- **Problem**: User starts game but never finishes
- **Solution**:
  - Remains in database as incomplete
  - User can resume anytime
  - Or explicitly abandon from Setup page
  - Could add auto-cleanup after X days (future)

## Testing the Feature

### Test 1: Browser Close & Reopen
1. Start a new game
2. Enter scores for 5-6 holes
3. Note the current hole and scores
4. Close the browser tab/window
5. Reopen app and go to home page
6. **Expected**: Orange "Game In Progress" banner appears
7. Click "Resume Game"
8. **Expected**: Game loads at the same hole with all scores intact

### Test 2: Multiple Device Sync
1. Start game on Device A (e.g., phone)
2. Enter some scores
3. Open app on Device B (e.g., computer)
4. Login with same account
5. **Expected**: Resume banner appears on home page
6. Click "Resume Game"
7. **Expected**: Game loads with latest state from Device A

### Test 3: Start New Game Warning
1. Have an active game in progress
2. Go to Setup page to start new game
3. **Expected**: Warning modal appears
4. Try each option:
   - Resume → Goes to active game
   - Continue Anyway → Allows new game setup
   - Abandon → Deletes active game
   - Back to Home → Returns to home page

### Test 4: Game Completion
1. Resume an active game
2. Complete all 18 holes
3. View dashboard
4. Navigate to home page
5. **Expected**: No resume banner (game is complete)
6. Go to History page
7. **Expected**: Completed game appears in history

## User Interface Elements

### Resume Game Banner (Home Page)
- **Color**: Orange to red gradient
- **Animation**: Pulsing effect to grab attention
- **Icon**: Clock icon
- **Content**:
  - "Game In Progress" heading
  - Course name
  - Player names (formatted)
  - Current hole number
  - Large "Resume Game" button

### Warning Modal (Setup Page)
- **Color**: White background with warning icon
- **Icon**: Warning triangle (orange)
- **Content**:
  - "Game In Progress" heading
  - Game details
  - Four action buttons (color-coded)
- **Behavior**: Blocks new game setup until resolved

### Loading State (Game Page)
- **Spinner**: Animated loading spinner
- **Text**: "Loading game..."
- **Duration**: Shows while fetching from Supabase
- **Fallback**: Redirects to setup if no game found

## Future Enhancements

### Potential Improvements:
1. **Auto-sync Indicator**: Show sync status in UI
2. **Offline Mode**: Allow play without internet, sync later
3. **Multiple Game Management**: List all incomplete games
4. **Game Sharing**: Resume a friend's game if they invite you
5. **Auto-abandon**: Delete incomplete games after 7 days
6. **Recovery**: Restore recently abandoned games

## Troubleshooting

### "Resume" button doesn't work
- **Check**: Browser console for errors
- **Verify**: User is logged in
- **Confirm**: Game exists in Supabase (Table Editor)

### Game doesn't load
- **Check**: Internet connection
- **Verify**: Supabase credentials in `.env.local`
- **Confirm**: RLS policies allow SELECT for authenticated users

### Wrong game loads
- **Issue**: Multiple incomplete games in database
- **Solution**: Delete old games from Supabase Table Editor
- **Prevention**: Always complete or abandon games

### Scores are lost
- **Check**: Browser console for save errors
- **Verify**: Network was connected during play
- **Solution**: Check Supabase logs for errors

## Benefits

✅ **Never Lose Progress**: All scores auto-saved
✅ **Cross-Device**: Play on phone, continue on tablet
✅ **User-Friendly**: Clear prompts and warnings
✅ **Flexible**: Multiple ways to handle active games
✅ **Reliable**: Cloud-based, survives browser crashes
✅ **Seamless**: Loads exactly where you left off

---

The resume game feature ensures users can always get back to their golf game, no matter what happens! ⛳
