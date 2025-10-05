/**
 * Environment Configuration Checker
 * Validates that Supabase is properly configured
 */

/**
 * Check if Supabase environment variables are configured
 * @returns {{isConfigured: boolean, missing: string[], url: string | null, hasAnonKey: boolean}}
 */
export function checkSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const missing = [];
  if (!url) missing.push('VITE_SUPABASE_URL');
  if (!anonKey) missing.push('VITE_SUPABASE_ANON_KEY');

  return {
    isConfigured: missing.length === 0,
    missing,
    url: url || null,
    hasAnonKey: !!anonKey,
  };
}

/**
 * Get user-friendly setup instructions
 * @returns {string}
 */
export function getSetupInstructions() {
  return `
Supabase is not configured. Please follow these steps:

1. Create a .env.local file in the golf-scoring-app directory
2. Add the following variables:

VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

3. Get these values from your Supabase project:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to Settings > API
   - Copy the Project URL and anon/public key

4. Restart the development server
  `.trim();
}

/**
 * Display configuration status in console
 */
export function displayConfigStatus() {
  const config = checkSupabaseConfig();

  if (config.isConfigured) {
    console.log('✅ Supabase configured successfully');
    console.log(`   URL: ${config.url}`);
  } else {
    console.error('❌ Supabase configuration missing!');
    console.error('   Missing:', config.missing.join(', '));
    console.error('\n' + getSetupInstructions());
  }

  return config.isConfigured;
}
