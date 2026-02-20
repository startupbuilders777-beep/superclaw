/**
 * Get the NEXTAUTH_URL, falling back to a sensible default based on environment
 */
export function getNextAuthUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // In production, throw an error if NEXTAUTH_URL is not set
  if (process.env.NODE_ENV === 'production') {
    console.error('NEXTAUTH_URL is not set in production environment!')
    // Return a placeholder - in production this should be configured
    return 'https://superclaw.vercel.app'
  }
  
  // Development fallback
  return 'http://localhost:3000'
}
