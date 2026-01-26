"use client"

import { Card } from "@/components/ui/card"
import { Calendar, Clock, Star } from "lucide-react"

interface Match {
  eventId?: string
  homeName?: string
  awayName?: string
  homeGoalUnderReview?: string
  awayGoalUnderReview?: string
  participantCountry?: string
  __FV__?: string
  bestOfFrames?: string
  tournamentName?: string
  eventStage?: string
  homeLogo?: string
  awayLogo?: string
  startDateTimeUtc?: string
  round?: string
}

interface UpcomingFixturesProps {
  matches: Match[]
  isLoading: boolean
}

function getMonthYear(dateString?: string): string {
  if (!dateString) return "TBD"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    })
  } catch {
    return "TBD"
  }
}

function getDateInfo(dateString?: string) {
  if (!dateString) return null
  try {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString("en-GB", { weekday: "short" }),
      time: date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      formatted: date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    }
  } catch {
    return null
  }
}

function getCountryFlag(country?: string): string {
  if (!country) return ""

  const countryMap: Record<string, string> = {
    china: "🇨🇳",
    england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    "northern ireland": "🇬🇧",
    ireland: "🇮🇪",
    australia: "🇦🇺",
    thailand: "🇹🇭",
    belgium: "🇧🇪",
    germany: "🇩🇪",
    "hong kong": "🇭🇰",
    iran: "🇮🇷",
    norway: "🇳🇴",
    switzerland: "🇨🇭",
    cyprus: "🇨🇾",
    malta: "🇲🇹",
    india: "🇮🇳",
    pakistan: "🇵🇰",
    finland: "🇫🇮",
    israel: "🇮🇱",
    poland: "🇵🇱",
    canada: "🇨🇦",
    "united states": "🇺🇸",
    usa: "🇺🇸",
    japan: "🇯🇵",
    "south korea": "🇰🇷",
    korea: "🇰🇷",
    brazil: "🇧🇷",
    france: "🇫🇷",
    spain: "🇪🇸",
    italy: "🇮🇹",
    netherlands: "🇳🇱",
    turkey: "🇹🇷",
    egypt: "🇪🇬",
    "saudi arabia": "🇸🇦",
    malaysia: "🇲🇾",
    singapore: "🇸🇬",
    vietnam: "🇻🇳",
    cn: "🇨🇳",
    gb: "🇬🇧",
    uk: "🇬🇧",
    ie: "🇮🇪",
    au: "🇦🇺",
    th: "🇹🇭",
    be: "🇧🇪",
    de: "🇩🇪",
    hk: "🇭🇰",
    ir: "🇮🇷",
    no: "🇳🇴",
    ch: "🇨🇭",
    cy: "🇨🇾",
    mt: "🇲🇹",
    in: "🇮🇳",
    pk: "🇵🇰",
    fi: "🇫🇮",
    il: "🇮🇱",
    pl: "🇵🇱",
    ca: "🇨🇦",
    us: "🇺🇸",
    jp: "🇯🇵",
    kr: "🇰🇷",
    br: "🇧🇷",
    fr: "🇫🇷",
    es: "🇪🇸",
    it: "🇮🇹",
    nl: "🇳🇱",
    tr: "🇹🇷",
    eg: "🇪🇬",
    sa: "🇸🇦",
    my: "🇲🇾",
    sg: "🇸🇬",
    vn: "🇻🇳",
  }

  const normalized = country.toLowerCase().trim()
  if (countryMap[normalized]) {
    return countryMap[normalized]
  }

  if (normalized.length === 2 && /^[a-z]{2}$/.test(normalized)) {
    const codePoints = normalized
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  return ""
}

function groupMatchesByMonth(matches: Match[]): Record<string, Match[]> {
  const groups: Record<string, Match[]> = {}

  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = a.startDateTimeUtc ? new Date(a.startDateTimeUtc).getTime() : Number.POSITIVE_INFINITY
    const dateB = b.startDateTimeUtc ? new Date(b.startDateTimeUtc).getTime() : Number.POSITIVE_INFINITY
    return dateA - dateB
  })

  sortedMatches.forEach((match) => {
    const monthYear = getMonthYear(match.startDateTimeUtc)
    if (!groups[monthYear]) {
      groups[monthYear] = []
    }
    groups[monthYear].push(match)
  })

  return groups
}

// Group matches by tournament within a month
function groupMatchesByTournament(matches: Match[]): Record<string, Match[]> {
  const groups: Record<string, Match[]> = {}
  
  matches.forEach((match) => {
    const tournament = match.tournamentName || "Snooker"
    if (!groups[tournament]) {
      groups[tournament] = []
    }
    groups[tournament].push(match)
  })

  return groups
}

export function UpcomingFixtures({ matches, isLoading }: UpcomingFixturesProps) {
  if (isLoading && matches.length === 0) {
    return (
      <Card className="bg-card border-border p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium">Fetching the latest fixtures</p>
            <p className="text-sm text-muted-foreground mt-1">This will only take a few seconds...</p>
          </div>
        </div>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <Card className="bg-card border-border p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No upcoming fixtures scheduled</p>
          <p className="text-xs text-muted-foreground">Check back later for new matches</p>
        </div>
      </Card>
    )
  }

  const groupedMatches = groupMatchesByMonth(matches)

  return (
    <div className="space-y-8">
      {Object.entries(groupedMatches).map(([monthYear, monthMatches]) => {
        const tournamentGroups = groupMatchesByTournament(monthMatches)
        
        return (
          <div key={monthYear}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">{monthYear}</h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {monthMatches.length} {monthMatches.length === 1 ? "match" : "matches"}
              </span>
            </div>

            <Card className="bg-card border-border overflow-hidden">
              <div className="divide-y divide-border">
                {Object.entries(tournamentGroups).map(([tournament, tournamentMatches]) => (
                  <div key={tournament}>
                    {/* Tournament Header */}
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground uppercase tracking-wide">
                          WORLD: {tournament}
                        </span>
                      </div>
                    </div>

                    {/* Matches */}
                    <div className="divide-y divide-border">
                      {tournamentMatches.map((match, index) => {
                        const matchId = match.eventId || `fixture-${index}`
                        const homeName = match.homeName || "TBD"
                        const awayName = match.awayName || "TBD"
                        const dateInfo = getDateInfo(match.startDateTimeUtc)
                        const homeFlag = getCountryFlag(match.participantCountry)
                        const awayFlag = getCountryFlag(match.__FV__)
                        const bestOf = match.bestOfFrames

                        return (
                          <div key={matchId} className="flex">
                            {/* Date/Time Column */}
                            <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center border-r border-border py-2 px-2">
                              <span className="text-xs text-muted-foreground">
                                {dateInfo?.formatted || "TBD"}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3 text-primary" />
                                <span className="text-xs font-medium text-foreground">
                                  {dateInfo?.time || "TBD"}
                                </span>
                              </div>
                            </div>

                            {/* Players Column */}
                            <div className="flex-1 py-1 px-4">
                              {/* Home Player */}
                              <div className="flex items-center py-1">
                                <div className="flex items-center gap-2">
                                  {homeFlag && <span className="text-sm">{homeFlag}</span>}
                                  <span className="text-sm font-medium text-foreground">{homeName}</span>
                                </div>
                              </div>
                              {/* Away Player */}
                              <div className="flex items-center py-1">
                                <div className="flex items-center gap-2">
                                  {awayFlag && <span className="text-sm">{awayFlag}</span>}
                                  <span className="text-sm font-medium text-foreground">{awayName}</span>
                                </div>
                              </div>
                            </div>

                            {/* Best Of Column */}
                            <div className="w-14 flex-shrink-0 flex items-center justify-center border-l border-border text-xs text-muted-foreground">
                              {bestOf ? `${bestOf} F` : "-"}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
