import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

const API_KEY = "vV8cNpUMeXc7LCCCHKytYWCR5mO6MzPbG5C8jiyi"
const BASE_URL = "https://api.sportdb.dev/api/flashscore"

const LIVE_CACHE_DURATION_SECONDS = 30 // 30 seconds

async function apiFetch(endpoint: string) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })
  if (!response.ok) return null
  return response.json()
}

async function fetchLiveMatchesFromAPI(): Promise<unknown[]> {
  try {
    const data = await apiFetch("/snooker/live")
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("[v0] Error fetching live matches:", error)
    return []
  }
}

// Server-side cached function using Next.js unstable_cache
// This cache persists across serverless function invocations
const getCachedLiveMatches = unstable_cache(
  async () => {
    const liveData = await fetchLiveMatchesFromAPI()
    return {
      data: liveData,
      fetchedAt: Date.now(),
    }
  },
  ["snooker-live-matches"], // Cache key
  {
    revalidate: LIVE_CACHE_DURATION_SECONDS, // Cache for 30 seconds
    tags: ["snooker-live"],
  }
)

export async function GET() {
  try {
    const result = await getCachedLiveMatches()

    return NextResponse.json({
      data: result.data,
      cached: true,
      nextRefresh: LIVE_CACHE_DURATION_SECONDS,
      fetchedAt: result.fetchedAt,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch live matches", details: String(error) },
      { status: 500 }
    )
  }
}
