# Debugging Score Storage Issue

## Server Restarted
- Fresh dev server running at **http://localhost:5175**
- All old processes killed
- New logging added

## How to Debug Score Storage

### Step 1: Open Browser Console
1. Open the app at http://localhost:5175
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Clear any old messages

### Step 2: Start a New Game
1. Click "New Game" from home page
2. Add players and configure the game
3. Start the game

### Step 3: Enter a Score
When you enter a score, you should see these logs:

```
[GameStore] updateScore: Hole 1, Player player-1, Score 4
[GameStore] updateScore: Updating state...
[GameStore] updateScore: Saving to Supabase...
[supabaseStorage] saveCurrentGame called with game ID: game-1234567890
[supabaseStorage] User authenticated: abc-123-def
[supabaseStorage] Checking if game exists...
[supabaseStorage] Game exists, updating...
[supabaseStorage] Update data: {id: "game-...", currentHole: 1, isComplete: false, holesWithScores: 1}
[supabaseStorage] ✅ Game updated successfully
[GameStore] updateScore: Save result: true
```

### Step 4: Check for Errors

#### ❌ If you see "User not authenticated"
**Problem**: Not logged in
**Solution**:
1. Go to `/auth`
2. Sign in or sign up
3. Verify your email
4. Try again

#### ❌ If you see "Insert error" or "Update error"
**Problem**: Database permission or schema issue
**Solution**:
1. Check the error message in console
2. Verify you ran the SQL schema in Supabase
3. Check RLS policies in Supabase dashboard
4. Verify `.env.local` credentials are correct

#### ❌ If no logs appear at all
**Problem**: Function not being called
**Solution**:
1. Refresh the page
2. Clear browser cache
3. Check if score input is working (should show in UI)
4. Check Network tab for errors

### Step 5: Verify in Supabase

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Select **games** table
4. Find your game by ID (shown in console logs)
5. Click to view details
6. Check the **holes** column (JSONB)
7. Expand to see if scores are there

### Expected Database Structure

**games** table should have:
```json
{
  "id": "game-1234567890",
  "created_by": "user-uuid",
  "course_name": "Standard Par 72",
  "current_hole": 1,
  "is_complete": false,
  "players": [...],
  "holes": [
    {
      "number": 1,
      "par": 4,
      "strokeIndex": 1,
      "scores": {
        "player-1": 4,
        "player-2": 5
      },
      "netScores": {...},
      "points": {...}
    },
    ...
  ],
  "totals": {...}
}
```

## Common Issues & Solutions

### Issue 1: Scores Show in UI But Not in Database

**Symptoms**:
- Scores appear on screen
- Console shows "Save result: false"
- No update/insert logs

**Cause**: Save function failing silently

**Debug**:
```javascript
// In console logs, look for:
[supabaseStorage] ❌ Error saving game to Supabase: <error details>
```

**Fix**:
- Check the error message
- Most likely authentication or permission issue
- Verify RLS policies

### Issue 2: Scores Disappear After Refresh

**Symptoms**:
- Scores entered successfully
- Refresh page, scores are gone
- Console shows successful save

**Cause**: Load function not working

**Debug**:
1. Check browser console on page load
2. Look for `[Game] Loading game...` logs
3. Check if `loadCurrentGame` is called

**Fix**:
- Problem is in loading, not saving
- Check `loadCurrentGame` function
- Verify game is in database (Supabase Table Editor)

### Issue 3: Wrong Game Loaded

**Symptoms**:
- Scores from different game appear
- Multiple games in database

**Cause**: Loading wrong game (oldest instead of newest)

**Fix**:
- Check the query in `loadCurrentGame`
- Should ORDER BY created_at DESC
- Clear old test games from database

## Testing Checklist

To verify scores are saving properly:

- [ ] Console shows `[GameStore] updateScore` logs
- [ ] Console shows `[supabaseStorage] saveCurrentGame` logs
- [ ] Console shows `✅ Game updated successfully`
- [ ] No error messages in console
- [ ] Supabase Table Editor shows the game
- [ ] Expanding `holes` JSONB shows scores
- [ ] `updated_at` timestamp changes after each score
- [ ] Refresh page and scores persist
- [ ] Resume game feature works

## Quick Test Script

Run this in browser console to test save function directly:

```javascript
// Get the game store
const { useGameStore } = await import('./src/store/gameStore.js');
const game = useGameStore.getState().game;

console.log('Current game:', game);
console.log('Game ID:', game?.id);
console.log('Current hole:', game?.currentHole);
console.log('Holes with scores:', game?.holes.filter(h => Object.keys(h.scores || {}).length > 0).length);
```

## SQL Query to Check Your Games

Run this in Supabase SQL Editor:

```sql
-- See all your games
SELECT
  id,
  course_name,
  current_hole,
  is_complete,
  created_at,
  updated_at,
  jsonb_array_length(holes) as total_holes,
  (SELECT COUNT(*) FROM jsonb_array_elements(holes) WHERE jsonb_typeof(elem->'scores') = 'object' AND jsonb_object_keys(elem->'scores') IS NOT NULL) as holes_with_scores
FROM games
WHERE created_by = auth.uid()
ORDER BY created_at DESC;
```

## Network Tab Check

1. Open DevTools → Network tab
2. Filter by "games"
3. Enter a score
4. You should see a POST or PATCH request to Supabase
5. Click on the request
6. Check the response (should be 200 OK)
7. Look at the request payload (should contain game data)

## Still Not Working?

If scores still aren't saving after all this:

1. **Export console logs**: Right-click in console → Save as
2. **Check Supabase status**: https://status.supabase.com
3. **Verify environment variables**:
   ```bash
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```
4. **Check RLS policies** in Supabase Dashboard → Authentication → Policies
5. **Check Supabase logs** in Dashboard → Logs

## Success Indicators

✅ When everything works, you should see:
- Immediate UI updates when entering scores
- Console logs showing successful saves
- Database updates visible in Supabase Table Editor
- Scores persist after browser refresh
- Resume game feature works correctly
- No error messages in console or Network tab

---

**Dev Server**: http://localhost:5175
**Check Console**: F12 → Console tab
**Check Network**: F12 → Network tab
**Check Database**: Supabase Dashboard → Table Editor → games
