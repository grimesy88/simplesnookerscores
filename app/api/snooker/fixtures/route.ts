import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

const API_KEY = "vV8cNpUMeXc7LCCCHKytYWCR5mO6MzPbG5C8jiyi"
const BASE_URL = "https://api.sportdb.dev/api/flashscore"

const FIXTURES_CACHE_DURATION_SECONDS = 60 * 60 // 1 hour in seconds

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

async function fetchAllRegions(): Promise<string[]> {
  try {
    const regions = await apiFetch("/snooker")
    if (!Array.isArray(regions)) return []
    
    return regions
      .filter((r: { slug?: string; id?: string }) => r.slug && r.id)
      .map((r: { slug: string; id: string }) => `${r.slug}:${r.id}`)
  } catch {
    return []
  }
}

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

async function fetchAllFixturesUncached(): Promise<{ fixtures: unknown[]; timestamp: number }> {
  try {
    const regions = await fetchAllRegions()
    console.log(`[v0] Fetching fixtures from ${regions.length} regions (cache miss)`)
    
    if (regions.length === 0) {
      return { fixtures: [], timestamp: Date.now() }
    }

    const regionPromises = regions.map((region) => fetchFixturesForRegion(region))
    const regionResults = await Promise.all(regionPromises)

    const allFixtures = regionResults.flat()

    const uniqueFixtures = Array.from(
      new Map(allFixtures.map((f: unknown) => [(f as { eventId?: string }).eventId, f])).values()
    )

    console.log(`[v0] Total unique fixtures collected: ${uniqueFixtures.length}`)
    return { fixtures: uniqueFixtures, timestamp: Date.now() }
  } catch (error) {
    console.log("[v0] Error in fetchAllFixtures:", error)
    return { fixtures: [], timestamp: Date.now() }
  }
}

// Use Next.js unstable_cache for server-side caching that persists across requests
const getCachedFixtures = unstable_cache(
  fetchAllFixturesUncached,
  ["snooker-fixtures"],
  {
    revalidate: FIXTURES_CACHE_DURATION_SECONDS,
    tags: ["snooker-fixtures"],
  }
)

export async function GET() {
  try {
    const result = await getCachedFixtures()
    
    const cacheAge = Math.round((Date.now() - result.timestamp) / 1000)
    const nextRefresh = Math.max(0, FIXTURES_CACHE_DURATION_SECONDS - cacheAge)

    return NextResponse.json({
      data: result.fixtures,
      cached: cacheAge > 5, // If fetched more than 5 seconds ago, it's from cache
      cacheAge,
      nextRefresh,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch fixtures", details: String(error) }, { status: 500 })
  }
}
