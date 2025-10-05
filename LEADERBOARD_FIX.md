# Leaderboard Fix - Circular Reference Error

## Error
```
Leaderboard.jsx:18 Uncaught ReferenceError: Cannot access 'playersWithRanks' before initialization
```

## Root Cause

The code was using `.map()` to build the `playersWithRanks` array, but inside the map function it tried to access `playersWithRanks[index - 1]` which doesn't exist yet during array creation.

**Problematic code**:
```javascript
const playersWithRanks = sortedPlayers.map((player, index) => {
  // ...
  if (index > 0) {
    if (points === prevPoints) {
      rank = playersWithRanks[index - 1].rank;  // ❌ Accessing array being built!
    }
  }
  return { ...player, points, rank };
});
```

This creates a **circular reference** - trying to read from an array while still creating it.

## Solution

Changed from `.map()` to `.forEach()` with an explicit array that we build incrementally:

```javascript
const playersWithRanks = [];
let currentRank = 1;

sortedPlayers.forEach((player, index) => {
  const points = totals[player.id] || 0;
  let rank = currentRank;

  if (index > 0) {
    const prevPlayer = playersWithRanks[index - 1];  // ✅ Now safe to access!
    const prevPoints = prevPlayer.points;

    if (points === prevPoints) {
      rank = prevPlayer.rank;  // Tie - same rank
    } else {
      rank = index + 1;        // New rank
      currentRank = rank;
    }
  }

  playersWithRanks.push({ ...player, points, rank });
});
```

## Why This Works

1. **Array exists before access**: We create the empty array first
2. **Sequential building**: Each iteration adds to the array before the next iteration
3. **Previous items available**: When we access `[index - 1]`, that item already exists
4. **No circular reference**: We're reading from a complete item, not during its creation

## Example Behavior

### Scenario 1: No Ties
```
Player A: 10 points → Rank 1 (🥇)
Player B: 7 points  → Rank 2 (🥈)
Player C: 5 points  → Rank 3 (🥉)
```

### Scenario 2: With Tie
```
Player A: 10 points → Rank 1 (🥇)
Player B: 7 points  → Rank 2 (🥈)
Player C: 7 points  → Rank 2 (🥈)  ← Tied with B
Player D: 5 points  → Rank 4       ← Skips rank 3
```

## Testing

1. Go to http://localhost:5177
2. Create a game with multiple players
3. Enter scores for all players
4. Complete the game
5. View the dashboard
6. **Leaderboard should display without errors**

## What Was Changed

**File**: `src/components/dashboard/Leaderboard.jsx`

**Lines changed**: 9-23

**Breaking changes**: None - output is identical, just fixed the initialization error

## Verification Checklist

- [ ] No console errors
- [ ] Leaderboard displays correctly
- [ ] Rankings show 🥇🥈🥉 for top 3
- [ ] Ties show same rank number
- [ ] "X points behind" shows correctly
- [ ] Leader highlighted in yellow
- [ ] Summary section shows correct info

## Success!

The leaderboard now works without initialization errors! ✅
