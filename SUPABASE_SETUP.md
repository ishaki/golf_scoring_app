# Supabase Setup Guide

This Golf Scoring app uses Supabase as its backend database and authentication service.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Node.js installed on your machine

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Project name: `golf-scoring` (or your preferred name)
   - Database password: Create a strong password (save it securely)
   - Region: Choose closest to your location
5. Click "Create new project" and wait for setup to complete (~2 minutes)

## Step 2: Run Database Schema

1. In your Supabase project dashboard, click on the **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Copy the entire contents of `supabase-schema-clean.sql` from this project
4. Paste it into the SQL editor
5. Click **"Run"** or press `Ctrl+Enter`
6. You should see "Success. No rows returned" - this is correct!

## Step 3: Get API Credentials

1. In Supabase dashboard, go to **Settings** (gear icon) → **API**
2. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 4: Configure Environment Variables

1. In the `golf-scoring-app` directory, create a file named `.env.local`
2. Add the following (replace with your actual values):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:**
- Replace `your-project-id.supabase.co` with your actual Project URL
- Replace `your-anon-key-here` with your actual anon public key
- Do NOT commit `.env.local` to version control (it's in `.gitignore`)

## Step 5: Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the browser console and look for:
   ```
   ✅ Supabase configured successfully
      URL: https://your-project-id.supabase.co
   ```

3. If you see errors about missing environment variables, double-check your `.env.local` file

## Step 6: Create Your Account

1. Navigate to the app in your browser (usually `http://localhost:5173`)
2. Click "Sign Up"
3. Enter your email and password
4. Check your email for verification link
5. Click the verification link to activate your account
6. You're ready to use the app!

## Database Structure

The app uses these tables:

### `profiles`
- Stores user profile information
- Automatically created when a user signs up

### `courses`
- Stores golf course configurations (9-hole and 18-hole)
- Comes with 3 default courses (Standard Par 72, Executive, Championship)
- Users can create custom courses

### `games`
- Stores all game data (in-progress and completed)
- Includes players, scores, holes, and totals
- Can be marked as public for sharing

## Row Level Security (RLS)

All tables have RLS enabled to ensure data privacy:

- **Profiles**: Users can only view/edit their own profile
- **Courses**: Users can view default/public courses and their own custom courses
- **Games**: Users can only access their own games

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists in `golf-scoring-app` directory
- Check that variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after creating/editing `.env.local`

### "relation does not exist" errors
- Run the SQL schema again
- Make sure you're in the correct Supabase project

### Authentication errors
- Verify email is confirmed
- Check Supabase dashboard → Authentication → Users
- Ensure RLS policies are set up correctly

### Data not appearing
- Check browser console for errors
- Verify you're logged in
- Check Supabase dashboard → Table Editor to see if data exists

## Migration from localStorage

If you were using an older version with localStorage:

1. Log in to your account
2. The app will automatically detect localStorage data
3. Follow the migration prompt to move your data to Supabase
4. Old localStorage data will be preserved until you manually clear it

## Development Tips

- Use Supabase Table Editor to view/edit data during development
- Check Supabase Logs for debugging authentication issues
- Use RLS policies to test permission scenarios
- Enable email confirmation in Supabase for production

## Production Deployment

When deploying to production:

1. Set environment variables in your hosting platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Configure email templates in Supabase:
   - Settings → Authentication → Email Templates

3. Set up custom domain (optional):
   - Settings → API → Custom Domain

4. Enable additional security:
   - Rate limiting
   - Email verification requirement
   - Password strength requirements

## Support

For issues:
- Check Supabase documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Open an issue in this repository

## Database Backup

Supabase automatically backs up your database. You can also:

1. Go to Database → Backups
2. Download manual backups
3. Schedule automatic backups (paid plans)
