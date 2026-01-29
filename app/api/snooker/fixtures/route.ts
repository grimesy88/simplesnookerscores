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

// All snooker regions/categories to query
const SNOOKER_REGIONS = [
  "world:8",
  "england:6",
  "china:78",
  "germany:3",
  "europe:5",
  "scotland:20",
  "wales:23",
  "northern-ireland:29",
  "belgium:7",
  "australia:4",
  "india:53",
  "thailand:28",
]

async function fetchFixturesForRegion(region: string): Promise<unknown[]> {
  try {
    const tournaments = await apiFetch(`/snooker/${region}`)
    if (!Array.isArray(tournaments) || tournaments.length === 0) {
      return []
    }

    const regionFixtures: unknown[] = []

    for (const tournament of tournaments) {
      const tournamentId = tournament.id
      const tournamentSlug = tournament.slug
      if (!tournamentSlug || !tournamentId) continue

      const tournamentPath = `${tournamentSlug}:${tournamentId}`

      try {
        const tournamentDetails = await apiFetch(`/snooker/${region}/${tournamentPath}`)
        if (!tournamentDetails) continue

        const seasons = tournamentDetails.seasons || []
        const season2026 = seasons.find((s: { season?: string; fixtures?: string }) => s.season === "2026")

        if (!season2026) continue

        const fixturesUrl = season2026.fixtures
        if (!fixturesUrl) continue

        const fixturesPath = fixturesUrl.replace("/api/flashscore", "")
        const fixturesData = await apiFetch(fixturesPath)

        if (fixturesData && Array.isArray(fixturesData)) {
          regionFixtures.push(...fixturesData)
        } else if (fixturesData && fixturesData.data && Array.isArray(fixturesData.data)) {
          regionFixtures.push(...fixturesData.data)
        }
      } catch {
        // Skip tournament on error
      }
    }

    return regionFixtures
  } catch {
    return []
  }
}

async function fetchAllFixtures(): Promise<unknown[]> {
  try {
    // Fetch fixtures from all regions in parallel
    const regionPromises = SNOOKER_REGIONS.map((region) => fetchFixturesForRegion(region))
    const regionResults = await Promise.all(regionPromises)

    // Flatten all fixtures into one array
    const allFixtures = regionResults.flat()

    // Remove duplicates based on eventId
    const uniqueFixtures = Array.from(
      new Map(allFixtures.map((f: unknown) => [(f as { eventId?: string }).eventId, f])).values()
    )

    console.log(`[v0] Total unique fixtures collected from ${SNOOKER_REGIONS.length} regions:`, uniqueFixtures.length)
    return uniqueFixtures
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
