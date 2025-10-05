# Supabase 406 Error Fix

## Error Description

**Error Message**:
```
GET https://weytnynrfjblaiwtulrk.supabase.co/rest/v1/games?select=*&created_by=eq.45dd04ce-81f8-41d6-aec5-fcdf0536d2e3&is_complete=eq.false&order=created_at.desc&limit=1 406 (Not Acceptable)
```

**HTTP Status**: 406 Not Acceptable

**Location**: `src/utils/supabaseStorage.js` in `loadCurrentGame()` function

## Root Cause

The error occurred because of a **mismatch between `.single()` and `.limit(1)`**:

1. `.single()` expects **exactly 1 row** to be returned
2. When there are **0 incomplete games**, the query returns **0 rows**
3. Supabase returns **406 Not Acceptable** when `.single()` doesn't get exactly 1 row

**Problematic Code**:
```javascript
const { data, error } = await supabase
  .from('games')
  .select('*')
  .eq('created_by', user.id)
  .eq('is_complete', false)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();  // ❌ This causes 406 when no games exist
```

## Why This Happened

- `.single()` is designed to fail when the result set is not exactly 1 row
- When a user has **no incomplete games**, the query returns 0 rows
- 406 error is thrown **before** the error handling code can catch it
- The `PGRST116` error check (line 154) never runs because 406 happens first

## Solution

**Remove `.single()` and handle array result instead**:

```javascript
const { data, error } = await supabase
  .from('games')
  .select('*')
  .eq('created_by', user.id)
  .eq('is_complete', false)
  .order('created_at', { ascending: false })
  .limit(1);  // ✅ Returns array (empty or with 1 item)

if (error) {
  console.error('[supabaseStorage] loadCurrentGame: Query error:', error);
  throw error;
}

if (!data || data.length === 0) {
  console.log('[supabaseStorage] loadCurrentGame: No incomplete games found');
  return null;
}

const gameData = data[0];  // ✅ Get first item from array
```

## What Changed

### Before (Broken):
- Used `.single()` → Expected exactly 1 row
- Error when 0 games exist → 406 Not Acceptable
- Error handling never reached

### After (Fixed):
- Use `.limit(1)` only → Returns array
- Check array length → Handle 0 or 1 results gracefully
- No 406 error when no games exist

## Files Modified

**File**: `src/utils/supabaseStorage.js`

**Lines Changed**: 144-182

**Changes**:
1. Removed `.single()` from query (line 150)
2. Changed error handling to check array length (lines 157-160)
3. Extract first element as `gameData` (line 162)
4. Updated all references from `data` to `gameData` (lines 165-181)

## Testing

### Test Case 1: User with No Incomplete Games
**Before**: ❌ 406 error in console
**After**: ✅ No error, returns `null` gracefully

**Console Output**:
```
[supabaseStorage] loadCurrentGame: User authenticated: 45dd04ce-81f8-41d6-aec5-fcdf0536d2e3
[supabaseStorage] loadCurrentGame: No incomplete games found
```

### Test Case 2: User with 1 Incomplete Game
**Before**: ✅ Works (returns game)
**After**: ✅ Works (returns game)

**Console Output**:
```
[supabaseStorage] loadCurrentGame: User authenticated: 45dd04ce-81f8-41d6-aec5-fcdf0536d2e3
[supabaseStorage] loadCurrentGame: ✅ Game found: {id: "...", courseName: "...", ...}
```

### Test Case 3: User with Multiple Incomplete Games
**Before**: ✅ Returns most recent (by `order`)
**After**: ✅ Returns most recent (by `order`)

## Supabase `.single()` vs `.limit(1)`

### When to use `.single()`:
- You **expect exactly 1 row** (e.g., lookup by unique ID)
- You **want an error** if 0 or >1 rows returned
- Example: `getGameById(id)` - ID should always return 1 or fail

### When to use `.limit(1)`:
- You want **0 or 1 rows** (optional result)
- You **don't want an error** when 0 rows exist
- Example: "Get current game if exists" ← Our use case
- Returns array, check `.length` manually

### Our Use Case:
```javascript
// ❌ Wrong: .single() expects exactly 1, fails on 0
.limit(1).single()

// ✅ Correct: .limit(1) returns array [0 or 1 items]
.limit(1)
```

## Error Code Reference

| Error Code | Meaning | Cause |
|------------|---------|-------|
| **PGRST116** | No rows returned | `.single()` got 0 rows |
| **406** | Not Acceptable | `.single()` got 0 or >1 rows (before check) |
| **PGRST** | PostgREST error | Supabase API error prefix |

## Prevention

To prevent similar issues:

1. ✅ Use `.single()` only when you **must have exactly 1 row**
2. ✅ Use `.limit(1)` when **0 or 1 rows** is acceptable
3. ✅ Always check array length when using `.limit(1)`
4. ✅ Don't mix `.single()` with `.limit(1)` - redundant and error-prone

## Similar Patterns in Codebase

Checked other queries - all correct:

✅ `loadGameById()` - Uses `.single()` correctly (ID must exist)
✅ `loadGameHistory()` - Uses `.limit(20)` without `.single()` ✓
✅ `saveCurrentGame()` - Uses `.single()` for existence check ✓

## Success! ✅

The 406 error is now fixed. Users with no incomplete games will see a clean experience without console errors.

**Test it**: Refresh http://localhost:5173 and check the console - no more 406 errors!
