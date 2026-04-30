import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }
  
  const progressFile = path.join(process.cwd(), 'tmp', `scrape-${sessionId}.json`)
  
  if (!fs.existsSync(progressFile)) {
    return NextResponse.json({ 
      status: 'not_found',
      progress: 0,
      leads: [],
      message: 'No progress file found'
    })
  }
  
  try {
    const progress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'))
    return NextResponse.json(progress)
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      progress: 0,
      leads: [],
      message: error.message 
    })
  }
}
