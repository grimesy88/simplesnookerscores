import { NextResponse } from "next/server"

const API_KEY = "vV8cNpUMeXc7LCCCHKytYWCR5mO6MzPbG5C8jiyi"
const BASE_URL = "https://api.sportdb.dev/api/flashscore"

let cachedFixturesData: unknown[] | null = null
let fixturesCacheTimestamp = 0
const FIXTURES_CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

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

async function fetchAllFixtures(): Promise<unknown[]> {
  try {
    // Step 1: Get all tournaments from world:8
    const tournaments = await apiFetch("/snooker/world:8")
    if (!Array.isArray(tournaments) || tournaments.length === 0) {
      console.log("[v0] No tournaments found in world:8")
      return []
    }
    console.log("[v0] Found tournaments:", tournaments.length)

    // Step 2: For each tournament, get details and find 2026 season
    const allFixtures: unknown[] = []

    for (const tournament of tournaments) {
      const tournamentId = tournament.id
      const tournamentSlug = tournament.slug
      if (!tournamentSlug || !tournamentId) continue

      const tournamentPath = `${tournamentSlug}:${tournamentId}`

      try {
        // Get tournament details with seasons
        const tournamentDetails = await apiFetch(`/snooker/world:8/${tournamentPath}`)
        if (!tournamentDetails) continue

        const seasons = tournamentDetails.seasons || []
        const season2026 = seasons.find((s: { season?: string; fixtures?: string }) => s.season === "2026")

        if (!season2026) {
          console.log(`[v0] No 2026 season for ${tournamentSlug}`)
          continue
        }

        console.log(`[v0] Found 2026 season for ${tournamentSlug}`)

        const fixturesUrl = season2026.fixtures
        if (!fixturesUrl) {
          console.log(`[v0] No fixtures URL for ${tournamentSlug}`)
          continue
        }

        // The fixtures URL is a full path like /api/flashscore/snooker/world:8/the-masters:GS36K259/2026/fixtures?page=1
        // We need to extract just the part after /api/flashscore
        const fixturesPath = fixturesUrl.replace("/api/flashscore", "")
        const fixturesData = await apiFetch(fixturesPath)

        if (fixturesData && Array.isArray(fixturesData)) {
          console.log(`[v0] Found ${fixturesData.length} fixtures for ${tournamentSlug}`)
          allFixtures.push(...fixturesData)
        } else if (fixturesData && fixturesData.data && Array.isArray(fixturesData.data)) {
          console.log(`[v0] Found ${fixturesData.data.length} fixtures for ${tournamentSlug}`)
          allFixtures.push(...fixturesData.data)
        }
      } catch (err) {
        console.log(`[v0] Error fetching tournament ${tournamentSlug}:`, err)
      }
    }

    console.log("[v0] Total fixtures collected:", allFixtures.length)
    return allFixtures
  } catch (error) {
    console.log("[v0] Error in fetchAllFixtures:", error)
    return []
  }
}

export async function GET() {
  const now = Date.now()
  const isCached = cachedFixturesData && now - fixturesCacheTimestamp < FIXTURES_CACHE_DURATION_MS

  try {
    let fixturesData = cachedFixturesData || []

    if (!isCached) {
      fixturesData = await fetchAllFixtures()
      cachedFixturesData = fixturesData
      fixturesCacheTimestamp = now
    }

    return NextResponse.json({
      data: fixturesData,
      cached: isCached,
      nextRefresh: isCached ? Math.round((FIXTURES_CACHE_DURATION_MS - (now - fixturesCacheTimestamp)) / 1000) : 3600,
    })
  } catch (error) {
    if (cachedFixturesData) {
      return NextResponse.json({
        data: cachedFixturesData,
        stale: true,
        cacheAge: Math.round((now - fixturesCacheTimestamp) / 1000),
      })
    }
    return NextResponse.json({ error: "Failed to fetch fixtures", details: String(error) }, { status: 500 })
  }
}
