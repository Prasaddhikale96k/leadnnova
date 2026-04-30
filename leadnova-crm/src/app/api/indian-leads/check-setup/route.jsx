import { NextResponse } from 'next/server'

export async function GET() {
  const hasApifyKey = !!process.env.APIFY_API_KEY

  return NextResponse.json({
    isReady: hasApifyKey,
    checks: {
      apifyConfigured: hasApifyKey,
      scraperType: 'apify-free-tier',
      monthlyLimit: '100 leads/month (Free)',
      message: hasApifyKey
        ? '✅ Apify configured - Free Tier (100 leads/month)'
        : '❌ Add APIFY_API_KEY to .env.local'
    }
  })
}
