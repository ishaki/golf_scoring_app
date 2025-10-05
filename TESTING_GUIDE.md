# Testing Guide: Course Creation

## How to Test Course Creation in Supabase

### Step 1: Open Browser Console

1. Start the dev server: `npm run dev`
2. Open the app in your browser
3. Open Developer Tools (F12)
4. Go to the **Console** tab

### Step 2: Create a Test Course

1. Navigate to **Courses** page
2. Click **"Create New Course"**
3. Fill in the form:
   - **Course Name**: "Test Course 1"
   - **Course Type**: 18-hole or 9-hole
   - Modify holes as needed (pars and stroke indexes)
4. Click **"Create Course"**

### Step 3: Check Console Logs

You should see detailed logs like:

```
[CourseStore] Creating course: {name: "Test Course 1", type: "18-hole", holes: Array(18)}
[CourseStore] Calling saveCourse with: {name: "Test Course 1", id: "course-1234567890", ...}
[supabaseCourseStorage] saveCourse called with: {...}
[supabaseCourseStorage] User authenticated: abc-123-def
[supabaseCourseStorage] Validating course...
[supabaseCourseStorage] Validation passed
[supabaseCourseStorage] Checking if course exists for update...
[supabaseCourseStorage] Course does not exist, inserting...
[supabaseCourseStorage] Inserting course data: {...}
[supabaseCourseStorage] Course inserted successfully: [{...}]
[CourseStore] Save result: true
[CourseStore] Reloaded courses: 4
```

### Step 4: Verify in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click **Table Editor** in sidebar
3. Select **courses** table
4. You should see your new course listed with:
   - ID: `course-1234567890...`
   - created_by: Your user ID
   - name: "Test Course 1"
   - type: "18-hole" or "9-hole"
   - holes: JSON array
   - is_default: false
   - is_public: false

### Step 5: Verify in App

1. Go back to the Courses page
2. Your new course should appear in the list
3. Try editing it (if not a default course)
4. Try creating a game with it

## Common Issues and Solutions

### ❌ "User not authenticated"

**Problem**: Not logged in

**Solution**:
1. Go to `/auth`
2. Sign in or sign up
3. Verify your email
4. Try again

### ❌ "Course name already exists"

**Problem**: Duplicate course name

**Solution**:
1. Use a different course name
2. Or delete the existing course from Supabase Table Editor
3. Try again

### ❌ No logs appearing

**Problem**: Console not showing logs

**Solution**:
1. Clear browser console
2. Refresh page
3. Try creating course again
4. Check Console filter (should be set to "All levels")

### ❌ "Permission denied" or RLS error

**Problem**: Row Level Security blocking insert

**Solution**:
1. Check you're logged in
2. Verify RLS policies in Supabase:
   - Go to Authentication → Policies
   - Check "courses" table has INSERT policy for authenticated users
3. Run SQL schema again if needed

### ❌ Insert error with specific message

**Problem**: Database constraint or validation error

**Solution**:
1. Check the error message in console
2. Common issues:
   - Invalid hole data (check pars are 3, 4, or 5)
   - Invalid stroke indexes (must be unique 1-9 or 1-18)
   - Missing required fields

## Manual Database Check

If the course isn't appearing, manually check Supabase:

### SQL Query to Check Your Courses

```sql
SELECT
  id,
  name,
  type,
  created_by,
  is_default,
  created_at
FROM courses
WHERE created_by = auth.uid()
ORDER BY created_at DESC;
```

Run this in Supabase SQL Editor to see all your courses.

### SQL Query to Check RLS Policies

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'courses';
```

This shows all Row Level Security policies on the courses table.

## Success Criteria

✅ Course appears in app course list
✅ Course visible in Supabase Table Editor
✅ Console shows "Course inserted successfully"
✅ Can select course when creating a game
✅ Can edit/delete custom courses (not default ones)

## Need More Help?

1. Copy the **entire console log** output
2. Check Supabase **Logs** section for server errors
3. Verify `.env.local` has correct credentials
4. Try creating a course with a very simple name like "Test"
5. Check your internet connection

## Cleanup

To remove test courses:

1. In Supabase Table Editor
2. Find your test course
3. Click the row
4. Click Delete
5. Or use SQL:
   ```sql
   DELETE FROM courses
   WHERE name = 'Test Course 1'
   AND created_by = auth.uid();
   ```
