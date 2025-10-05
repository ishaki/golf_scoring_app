# Step-by-Step Test Guide - Game Resume Feature

## Current Issue
- No link to return to running game
- No record in database for games

## Root Cause Analysis
Most likely: **Not logged in** or **Game not being saved**

---

## ✅ STEP 1: Verify You're Logged In

### A. Open the App
Go to: **http://localhost:5175**

### B. Check Authentication Status
1. Open Console (F12)
2. Type and run:
   ```javascript
   import('./src/store/authStore.js').then(m => {
     const user = m.default.getState().user;
     console.log('Current user:', user);
   });
   ```

### C. Expected Results

**✅ If Logged In:**
```javascript
Current user: {
  id: "abc-123-def...",
  email: "you@example.com",
  email_confirmed_at: "2024-10-05...",
  ...
}
```

**❌ If NOT Logged In:**
```javascript
Current user: null
```

### D. If Not Logged In - Sign Up/Login

1. Click on your profile icon or go to `/auth`
2. **Sign Up** with a new email, or **Sign In** if you already have an account
3. **Important**: Check your email and click the verification link
4. Come back to the app
5. Verify you're logged in (repeat Step B)

---

## ✅ STEP 2: Create a New Game (With Logging)

### A. Clear Console
1. Open Console (F12)
2. Click the clear button or press Ctrl+L

### B. Start a New Game
1. Go to home page: **http://localhost:5175**
2. Click **"New Game"**
3. Add 2-4 players
4. Click Next through the steps
5. **Click "Start Game"**

### C. Watch Console Logs

**Expected logs when creating game:**
```
[GameStore] createGame: Creating new game with 2 players
[GameStore] createGame: New game created: {id: "game-...", ...}
[GameStore] createGame: Saving to Supabase...
[supabaseStorage] saveCurrentGame called with game ID: game-...
[supabaseStorage] User authenticated: abc-123-def
[supabaseStorage] Checking if game exists...
[supabaseStorage] Game does not exist, inserting...
[supabaseStorage] Insert data: {...}
[supabaseStorage] ✅ Game inserted successfully
[GameStore] createGame: Initial save result: true
```

### D. What If You See Errors?

**Error: "User not authenticated"**
→ Go back to Step 1, you're not logged in

**Error: "Insert error" or "Update error"**
→ Check the full error message
→ Most likely RLS policy issue or SQL schema not run

**No logs at all**
→ Hard refresh the page (Ctrl+Shift+R)
→ Check if dev server is running

---

## ✅ STEP 3: Enter a Score

### A. On the Game Page
1. You should see Hole 1
2. Enter a score for Player 1 (e.g., type "4")
3. Enter a score for Player 2 (e.g., type "5")

### B. Watch Console Logs

**Expected logs:**
```
[GameStore] updateScore: Hole 1, Player player-1, Score 4
[GameStore] updateScore: Updating state...
[GameStore] updateScore: Saving to Supabase...
[supabaseStorage] saveCurrentGame called with game ID: game-...
[supabaseStorage] User authenticated: abc-123-def
[supabaseStorage] Checking if game exists...
[supabaseStorage] Game exists, updating...
[supabaseStorage] Update data: {id: "game-...", currentHole: 1, ...}
[supabaseStorage] ✅ Game updated successfully
[GameStore] updateScore: Save result: true
```

---

## ✅ STEP 4: Verify in Supabase Dashboard

### A. Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Table Editor** in sidebar
4. Click **games** table

### B. Check for Your Game
You should see a row with:
- **id**: `game-1234567890...`
- **created_by**: Your user UUID
- **course_name**: The course you selected
- **current_hole**: `1`
- **is_complete**: `false` ✓ (This is important!)
- **players**: Click to expand JSONB
- **holes**: Click to expand JSONB and see scores

### C. If No Game Appears

**Check these:**
1. Are you looking at the right Supabase project?
2. Check the **created_by** - does it match your user ID?
3. Run this SQL query in SQL Editor:
   ```sql
   SELECT * FROM games
   WHERE created_by = auth.uid()
   ORDER BY created_at DESC;
   ```

---

## ✅ STEP 5: Test Resume Game Feature

### A. Close the Browser Tab
1. Close the tab or entire browser
2. **Wait 5 seconds**

### B. Reopen and Go to Home
1. Open browser
2. Go to **http://localhost:5175**
3. Make sure you're logged in (should auto-login if you were before)

### C. Watch Console Logs

**Expected:**
```
[Home] Checking for active game, user: abc-123-def
[Home] User authenticated, loading game...
[GameStore] loadGame: Called with gameId: null
[GameStore] loadGame: Loading current game from Supabase...
[supabaseStorage] loadCurrentGame: Checking for active game...
[supabaseStorage] loadCurrentGame: User authenticated: abc-123-def
[supabaseStorage] loadCurrentGame: ✅ Game found: {id: "game-...", ...}
[GameStore] loadGame: Result: Found game
[GameStore] loadGame: Game details: {id: "game-...", currentHole: 1, ...}
[Home] Load complete, current game: {id: "game-...", ...}
```

### D. Expected UI

You should see an **ORANGE BANNER** like this:

```
┌─────────────────────────────────────────────┐
│  🕐 Game In Progress                        │
│                                             │
│  Course: Standard Par 72                    │
│  Players: John & Mike                       │
│  Current Hole: 1 of 18                      │
│                                             │
│  [▶ Resume Game]  ← BIG ORANGE BUTTON       │
└─────────────────────────────────────────────┘
```

### E. Click "Resume Game"
- Should navigate to `/game`
- Should show Hole 1 with your previously entered scores
- Leaderboard should show correct points

---

## ❌ TROUBLESHOOTING

### Issue: No orange banner appears

**Possible causes:**

1. **Not logged in**
   - Check console: `[Home] No user, skipping game load`
   - Solution: Log in via `/auth`

2. **No game in database**
   - Check console: `[supabaseStorage] loadCurrentGame: No incomplete games found`
   - Check Supabase Table Editor → games table
   - Solution: Create a new game and ensure it saves

3. **Game is marked as complete**
   - Check Supabase: `is_complete = true`
   - Solution: Create a new game or update the row to `is_complete = false`

4. **Game state issue**
   - Check console: `[Home] Load complete, current game: null`
   - Even though database has the game
   - Solution: Check for errors in loadCurrentGame

### Issue: Console shows "User not authenticated"

**Solution:**
```
1. Go to /auth
2. Sign in or sign up
3. Check email and verify
4. Refresh app
5. Try again
```

### Issue: Console shows "Insert error" or permission denied

**Possible causes:**
- RLS policies not set up
- SQL schema not run
- Wrong credentials in .env.local

**Solution:**
1. Check `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```
2. Re-run SQL schema from `supabase-schema-clean.sql`
3. Check RLS policies in Supabase Dashboard

### Issue: Game saves but doesn't load

**Check SQL query in Supabase:**
```sql
-- This should return your game
SELECT
  id,
  course_name,
  current_hole,
  is_complete,
  created_by
FROM games
WHERE created_by = auth.uid()
  AND is_complete = false
ORDER BY created_at DESC
LIMIT 1;
```

If query returns nothing:
- Check `created_by` matches your user ID
- Check `is_complete` is `false`
- Check you're using the right Supabase project

---

## 📊 Complete Test Checklist

Run through this checklist:

- [ ] Logged in and email verified
- [ ] Console logs show user ID
- [ ] Created new game - console shows "Game inserted successfully"
- [ ] Game appears in Supabase Table Editor
- [ ] Entered scores - console shows "Game updated successfully"
- [ ] Scores visible in database (holes JSONB column)
- [ ] Closed browser and reopened
- [ ] Orange banner appears on home page
- [ ] Banner shows correct game info
- [ ] Clicked "Resume Game" button
- [ ] Game page loads with correct hole
- [ ] Scores are intact
- [ ] Can continue playing

---

## 🔑 Key Points

1. **You MUST be logged in** - check with console command
2. **Email MUST be verified** - check your inbox
3. **Watch console logs** - they tell you exactly what's happening
4. **Check Supabase database** - verify data is actually there
5. **is_complete MUST be false** - or game won't show as "resumable"

---

## 🆘 Still Not Working?

Copy and send me:

1. **Console logs** from creating a game
2. **Console logs** from loading home page
3. **Screenshot** of Supabase games table
4. **Screenshot** of Supabase RLS policies for games table
5. **Your .env.local** file (HIDE the keys, just show they exist)

The logs will tell us exactly where it's failing!
