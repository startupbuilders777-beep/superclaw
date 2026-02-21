/**
 * Environment validation utilities
 * Provides clear error messages when required environment variables are missing
 */

export function validateEnvVars() {
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ]

  const missingVars: string[] = []

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`)
    console.error('Please add these variables to your .env file or Vercel project settings.')
    
    // In production, we don't want to crash the app but we should log the error
    if (process.env.NODE_ENV === 'production') {
      console.error('Production environment is missing required configuration!')
    }
  }

  return missingVars
}

/**
 * Check if the database is configured and accessible
 * Returns true if DATABASE_URL is set to a valid production URL (not localhost)
 * Returns false if:
 *   - DATABASE_URL is not set
 *   - DATABASE_URL is empty
 *   - DATABASE_URL points to localhost (won't work in serverless/production)
 */
export function isDatabaseConfigured(): boolean {
  const dbUrl = process.env.DATABASE_URL
  
  if (!dbUrl || dbUrl === '') {
    return false
  }
  
  // Check for localhost URLs - these won't work in Vercel serverless
  if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    console.error('[env] DATABASE_URL points to localhost which will not work in production/serverless environments')
    return false
  }
  
  return true
}

/**
 * Get database configuration status with detailed information
 * Useful for debugging and providing specific error messages
 */
export function getDatabaseConfigStatus(): {
  configured: boolean;
  reason?: string;
  urlPreview?: string;
} {
  const dbUrl = process.env.DATABASE_URL
  
  if (!dbUrl || dbUrl === '') {
    return { 
      configured: false, 
      reason: 'DATABASE_URL is not set',
      urlPreview: undefined
    }
  }
  
  if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    return { 
      configured: false, 
      reason: 'DATABASE_URL points to localhost - this will not work in production. Use a hosted database like Neon, Supabase, or Railway.',
      urlPreview: dbUrl.replace(/\/\/.*:.*@/, '//***:***@') // Mask credentials
    }
  }
  
  return { 
    configured: true,
    urlPreview: dbUrl.replace(/\/\/.*:.*@/, '//***:***@')
  }
}
