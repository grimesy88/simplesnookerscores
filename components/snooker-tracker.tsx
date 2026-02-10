"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { LiveMatches } from "./live-matches"
import { UpcomingFixtures } from "./upcoming-fixtures"
import { FeedbackButton } from "./feedback-button"
import { PlayerSearch } from "./player-search"
import { RefreshCw, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Match {
  eventId?: string
  homeName?: string
  awayName?: string
  homeScore?: string
  awayScore?: string
  participantCountry?: string
  bestOfFrames?: string
  tournamentName?: string
  eventStage?: string
  homeLogo?: string
  awayLogo?: string
  startDateTimeUtc?: string
}

export function SnookerTracker() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [isLiveLoading, setIsLiveLoading] = useState(true)
  const [isFixturesLoading, setIsFixturesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [liveCacheInfo, setLiveCacheInfo] = useState<{ cached: boolean; nextRefresh: number } | null>(null)
  const [countdown, setCountdown] = useState<number>(30)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter matches based on search query
  const filteredLiveMatches = useMemo(() => {
    if (!searchQuery.trim()) return liveMatches
    const query = searchQuery.toLowerCase()
    return liveMatches.filter(
      (m) =>
        m.homeName?.toLowerCase().includes(query) ||
        m.awayName?.toLowerCase().includes(query)
    )
  }, [liveMatches, searchQuery])

  const filteredUpcomingMatches = useMemo(() => {
    if (!searchQuery.trim()) return upcomingMatches
    const query = searchQuery.toLowerCase()
    return upcomingMatches.filter(
      (m) =>
        m.homeName?.toLowerCase().includes(query) ||
        m.awayName?.toLowerCase().includes(query)
    )
  }, [upcomingMatches, searchQuery])

  const fetchLiveMatches = useCallback(async () => {
    setIsLiveLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/snooker/live")

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Failed to fetch live: ${response.status}`)
      }

      const result = await response.json()
      const live = Array.isArray(result.data) ? result.data : []

      setLiveMatches(live)
      setLiveCacheInfo({
        cached: result.cached,
        nextRefresh: result.nextRefresh,
      })
      setCountdown(result.nextRefresh ?? 30)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLiveLoading(false)
    }
  }, [])

  const fetchFixtures = useCallback(async () => {
    setIsFixturesLoading(true)

    try {
      const response = await fetch("/api/snooker/fixtures")

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Failed to fetch fixtures: ${response.status}`)
      }

      const result = await response.json()
      const fixtures = Array.isArray(result.data) ? result.data : []

      // Filter fixtures to only show scheduled matches (not finished or live)
      const scheduled = fixtures.filter((match: Match) => match.eventStage?.toUpperCase() === "SCHEDULED")

      setUpcomingMatches(scheduled)
    } catch (err) {
      // Don't overwrite live error
      if (!error) {
        setError(err instanceof Error ? err.message : "An error occurred")
      }
    } finally {
      setIsFixturesLoading(false)
    }
  }, [error])

  const fetchMatches = useCallback(async () => {
    await fetchLiveMatches()
    await fetchFixtures()
  }, [fetchLiveMatches, fetchFixtures])

  const isLoading = isLiveLoading || isFixturesLoading

  useEffect(() => {
    // Fetch live matches immediately and every 30 seconds
    fetchLiveMatches()
    const liveInterval = setInterval(fetchLiveMatches, 30000)
    
    // Fetch fixtures once (they're cached for an hour on the server)
    fetchFixtures()
    
    return () => clearInterval(liveInterval)
  }, [fetchLiveMatches, fetchFixtures])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Simple Snooker Scores</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Live Scores & Fixtures</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <PlayerSearch
                liveMatches={liveMatches}
                upcomingMatches={upcomingMatches}
                onSearch={setSearchQuery}
                searchQuery={searchQuery}
              />
              <FeedbackButton />
              {lastUpdated && (
                <div className="text-xs text-muted-foreground hidden sm:flex flex-col items-end">
                  <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                  {liveCacheInfo && (
                    <span className="text-[10px]">
                      {liveCacheInfo.cached ? "From cache" : "Fresh"} · Next in {countdown}s
                    </span>
                  )}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMatches}
                disabled={isLoading}
                className="gap-2 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* SEO Introduction */}
        <section className="mb-10">
          <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
            Welcome to Simple Snooker Scores, your fast and lightweight destination for live snooker updates. Whether you're following the World Snooker Tour, the Masters, or the World Championship, we provide real-time frame scores without the bloat.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl mt-3">
            Our mission is simple: provide the latest snooker results and upcoming match schedules on a site that loads instantly on any device. No heavy ads, no slow scripts—just the scores you need.
          </p>
        </section>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Live Matches Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Circle className="h-3 w-3 fill-live text-live animate-pulse" />
              <h2 className="text-2xl font-bold text-foreground uppercase tracking-tight">Today</h2>
            </div>
            {liveMatches.length > 0 && (
              <span className="bg-live/20 text-live text-xs font-semibold px-2 py-1 rounded">
                {liveMatches.length} {liveMatches.length === 1 ? "Match" : "Matches"}
              </span>
            )}
          </div>
          <LiveMatches matches={filteredLiveMatches} isLoading={isLiveLoading} />
        </section>

        {/* Upcoming Fixtures Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-foreground uppercase tracking-tight">Upcoming Fixtures</h2>
            {upcomingMatches.length > 0 && (
              <span className="bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-1 rounded">
                {upcomingMatches.length} {upcomingMatches.length === 1 ? "Match" : "Matches"}
              </span>
            )}
          </div>
          <UpcomingFixtures matches={filteredUpcomingMatches} isLoading={isFixturesLoading} />
        </section>
      </div>
    </div>
  )
}
