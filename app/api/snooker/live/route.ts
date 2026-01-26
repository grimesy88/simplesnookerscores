import { NextResponse } from "next/server"

const API_KEY = "vV8cNpUMeXc7LCCCHKytYWCR5mO6MzPbG5C8jiyi"
const BASE_URL = "https://api.sportdb.dev/api/flashscore"

let cachedLiveData: unknown[] | null = null
let liveCacheTimestamp = 0
const LIVE_CACHE_DURATION_MS = 30 * 1000 // 30 seconds

async function apiFetch(endpoint: string) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
  })
  if (!response.ok) return null
  return response.json()
}

export async function GET() {
  const now = Date.now()
  const isCached = cachedLiveData && now - liveCacheTimestamp < LIVE_CACHE_DURATION_MS

  try {
    let liveData = cachedLiveData || []

    if (!isCached) {
      liveData = await apiFetch("/snooker/live").then((data) => (Array.isArray(data) ? data : []))
      cachedLiveData = liveData
      liveCacheTimestamp = now
    }

    return NextResponse.json({
      data: liveData,
      cached: isCached,
      nextRefresh: isCached ? Math.round((LIVE_CACHE_DURATION_MS - (now - liveCacheTimestamp)) / 1000) : 30,
    })
  } catch (error) {
    if (cachedLiveData) {
      return NextResponse.json({
        data: cachedLiveData,
        stale: true,
        cacheAge: Math.round((now - liveCacheTimestamp) / 1000),
      })
    }
    return NextResponse.json({ error: "Failed to fetch live matches", details: String(error) }, { status: 500 })
  }
}
