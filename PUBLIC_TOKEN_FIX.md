# Public Token Missing - Fixed

## Problem
When trying to share a dashboard, the public link showed:
```
http://localhost:5178/shared/undefined
```

The `publicToken` was `undefined` because it wasn't being loaded from the database.

## Root Cause
The `public_token` and `is_public` fields from the database were **not mapped** to the JavaScript game object in three places:
1. `loadCurrentGame()`
2. `loadGameHistory()`
3. `loadGameById()`

## Solution
Added `isPublic` and `publicToken` fields to all game data mappings.

## Files Fixed

### File: `src/utils/supabaseStorage.js`

**Three functions updated**:

#### 1. `loadCurrentGame()` (lines 172-184)
```javascript
return {
  id: gameData.id,
  createdAt: gameData.created_at,
  players: gameData.players,
  holes: gameData.holes,
  currentHole: gameData.current_hole,
  isComplete: gameData.is_complete,
  totals: gameData.totals,
  courseName: gameData.course_name,
  isPublic: gameData.is_public,        // ✅ Added
  publicToken: gameData.public_token   // ✅ Added
};
```

#### 2. `loadGameHistory()` (lines 260-271)
```javascript
return (data || []).map(game => ({
  id: game.id,
  createdAt: game.created_at,
  players: game.players,
  holes: game.holes,
  currentHole: game.current_hole,
  isComplete: game.is_complete,
  totals: game.totals,
  courseName: game.course_name,
  isPublic: game.is_public,        // ✅ Added
  publicToken: game.public_token   // ✅ Added
}));
```

#### 3. `loadGameById()` (lines 302-313)
```javascript
return {
  id: data.id,
  createdAt: data.created_at,
  players: data.players,
  holes: data.holes,
  currentHole: data.current_hole,
  isComplete: data.is_complete,
  totals: data.totals,
  courseName: data.course_name,
  isPublic: data.is_public,        // ✅ Added
  publicToken: data.public_token   // ✅ Added
};
```

## Database Schema

The `games` table already has these fields:
- `public_token` (UUID) - Auto-generated with `uuid_generate_v4()`
- `is_public` (BOOLEAN) - Default `false`

These are set automatically when a new game is created.

## Important Note for Existing Games

⚠️ **Games created BEFORE this fix may not have a `public_token`**

This can happen if:
- The database default wasn't set correctly
- Games were created before the schema was updated

### Solution for Existing Games:

**Option 1: Create a new game** (Recommended)
- New games will automatically get a `public_token`
- Works immediately

**Option 2: Update existing games via SQL**
Run this in Supabase SQL Editor:
```sql
UPDATE games
SET public_token = uuid_generate_v4()
WHERE public_token IS NULL;
```

## How to Test

### Test with NEW Game:
1. Create a new game
2. Complete all 18 holes
3. View Dashboard
4. Click "Share Dashboard"
5. Toggle "Share publicly" ON
6. Copy the link
7. ✅ Link should be: `http://localhost:5178/shared/{uuid}`

### Test with OLD Game:
1. View an old completed game from History
2. Click "View Details" → Dashboard
3. Click "Share Dashboard"
4. If link shows `undefined`:
   - Run SQL update above
   - Refresh the page
   - Try sharing again

## How Public Sharing Works

1. **Database auto-generates** `public_token` (UUID) on game creation
2. **Game loads** with `publicToken` field
3. **ShareModal** uses `game.publicToken` to build URL
4. **Toggle sharing** sets `is_public = true/false`
5. **Public route** `/shared/:token` looks up game by `public_token` where `is_public = true`

## Success! ✅

The public token is now properly loaded from the database. New games will work perfectly!

For existing games, run the SQL update to add tokens retroactively.
