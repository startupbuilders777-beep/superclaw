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
 * Returns true if DATABASE_URL is set (even if connection not tested)
 */
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== ''
}
