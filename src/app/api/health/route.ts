import { NextResponse } from 'next/server'

// GET /api/health — lightweight health check for HYDRA monitoring
// No auth required, no DB calls, sub-10ms response
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: 'healthy',
  })
}
