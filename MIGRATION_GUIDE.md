# Migration Guide: localStorage to Supabase

This guide helps you migrate from the localStorage-based version to the Supabase cloud database.

## Why Migrate?

**Benefits of Supabase:**
- ✅ Access your data from any device
- ✅ No data loss when clearing browser cache
- ✅ Real-time sync across devices
- ✅ Secure cloud backup
- ✅ Share games with friends
- ✅ Better performance with large datasets

## Before You Start

1. **Backup your current data:**
   - Open browser DevTools (F12)
   - Go to Application → Local Storage
   - Right-click → Copy all data
   - Save to a text file as backup

2. **Set up Supabase:**
   - Follow `SUPABASE_SETUP.md` first
   - Create your account
   - Verify your email

## Automatic Migration

The app includes automatic migration for most users:

### Step 1: Sign Up / Log In

1. Start the app and click "Sign Up"
2. Create your account with email and password
3. Verify your email address
4. Log in to the app

### Step 2: Migration Detection

The app will automatically:
- Detect existing localStorage data
- Show a migration prompt
- List what will be migrated:
  - Custom courses
  - Game history
  - Current in-progress game

### Step 3: Confirm Migration

1. Review the migration summary
2. Click "Migrate Now"
3. Wait for migration to complete
4. See success confirmation

### Step 4: Verify Data

After migration:
1. Check **Courses** page → Your custom courses should appear
2. Check **History** page → Past games should be listed
3. If you had a game in progress, it will resume

## Manual Migration

If automatic migration fails or you prefer manual control:

### Export from localStorage

1. Open browser console (F12)
2. Run these commands:

```javascript
// Export courses
const courses = localStorage.getItem('golf-scoring:courses');
console.log('Courses:', courses);

// Export game history
const history = localStorage.getItem('golf-scoring:history');
console.log('History:', history);

// Export current game
const currentGame = localStorage.getItem('golf-scoring:current-game');
console.log('Current Game:', currentGame);
```

3. Copy each output to separate text files

### Import to Supabase

Contact support or use the Supabase dashboard to import the JSON data directly.

## What Gets Migrated

### ✅ Migrated Automatically
- **Custom Courses**: All user-created courses
- **Game History**: All completed games (up to 20 most recent)
- **Current Game**: Any in-progress game
- **Player Data**: Names, handicaps, "voor" settings

### ❌ NOT Migrated
- **Default Courses**: Already exist in Supabase
- **App Settings**: Need to be reconfigured
- **Browser Preferences**: Theme, etc.

## Post-Migration Checklist

After successful migration:

- [ ] Verify all custom courses appear in Courses page
- [ ] Check game history shows all past games
- [ ] Resume any in-progress game
- [ ] Test creating a new game
- [ ] Test editing courses
- [ ] Clear localStorage (optional - see below)

## Clearing localStorage

**After confirming all data migrated successfully:**

1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Right-click on your site → Clear
4. Or run in console:
   ```javascript
   localStorage.clear();
   ```

**Important:** Only do this after verifying your data is in Supabase!

## Troubleshooting

### Migration fails with "User not authenticated"
- Log out and log back in
- Verify your email is confirmed
- Check internet connection

### Some games missing after migration
- localStorage limit: 20 most recent games
- Check if games exist in localStorage first
- Try manual export/import

### Courses show duplicate names
- Supabase prevents duplicate course names
- Rename courses in localStorage before migration
- Or delete duplicates after migration

### "PGRST116" or database errors
- Check Supabase project is active
- Verify SQL schema was run correctly
- Check RLS policies are enabled

### Migration prompt doesn't appear
- Check browser console for errors
- Verify localStorage has data: `localStorage.getItem('golf-scoring:courses')`
- Try refreshing the page

## Hybrid Usage (Not Recommended)

While technically possible to use both localStorage and Supabase, we **strongly recommend against it**:

- Data will not sync between them
- Can cause confusion and data loss
- App is designed for Supabase-only mode

If you must use localStorage-only mode, use an older version of the app.

## Rolling Back

If you need to revert to localStorage-only:

1. Restore your localStorage backup
2. Checkout an older version of the code (before Supabase migration)
3. Or disable Supabase by removing `.env.local`

**Note:** This means losing cloud sync benefits.

## Data Privacy

Your data in Supabase:
- Is encrypted at rest and in transit
- Is only accessible to you (Row Level Security)
- Can be deleted anytime from your profile
- Follows Supabase's privacy policy

To delete all your data:
1. Go to Profile page
2. Click "Delete Account"
3. Confirm deletion

## Support

Need help with migration?

1. Check browser console for specific error messages
2. Verify Supabase setup in `SUPABASE_SETUP.md`
3. Check Supabase dashboard → Logs for server errors
4. Open an issue on GitHub with:
   - Browser console errors
   - Migration step where it failed
   - Browser and OS version

## Timeline

- **Now**: localStorage deprecated (still works for migration)
- **Future version**: localStorage support removed entirely
- **Recommendation**: Migrate as soon as possible

## Success Stories

After migration, you can:
- Play golf, score on your phone, view results on computer
- Share your game history with friends
- Never worry about losing data
- Access scorecards from any device
- Track progress over time with cloud storage

## FAQ

**Q: Can I use the app offline after migration?**
A: Currently requires internet connection. Offline mode coming in future release.

**Q: How much data can I store?**
A: Supabase free tier: 500MB database (enough for thousands of games)

**Q: What if I have multiple devices with different localStorage data?**
A: Migrate from the device with the most complete data first. Other devices will sync automatically once logged in.

**Q: Is migration reversible?**
A: Yes, but you'll need your localStorage backup to restore.

**Q: Do I need to migrate immediately?**
A: Recommended but not required. Future versions may remove localStorage support.
