"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Circle, Clock, Star } from "lucide-react"
import Image from "next/image"

interface Match {
  eventId?: string
  homeName?: string
  awayName?: string
  homeScore?: string
  awayScore?: string
  participantCountry?: string
  __FV__?: string
  bestOfFrames?: string
  tournamentName?: string
  eventStage?: string
  homeLogo?: string
  awayLogo?: string
  startDateTimeUtc?: string
  startTime?: string
  round?: string
  infoNotice?: string
  winner?: string
}

function getCountryFlag(country: string | undefined): string {
  if (!country) return ""

  const countryMap: Record<string, string> = {
    england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    eng: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    sco: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    wal: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    "northern ireland": "🇬🇧",
    nir: "🇬🇧",
    ireland: "🇮🇪",
    china: "🇨🇳",
    "hong kong": "🇭🇰",
    thailand: "🇹🇭",
    belgium: "🇧🇪",
    germany: "🇩🇪",
    australia: "🇦🇺",
    canada: "🇨🇦",
    iran: "🇮🇷",
    malaysia: "🇲🇾",
    pakistan: "🇵🇰",
    india: "🇮🇳",
    cyprus: "🇨🇾",
    malta: "🇲🇹",
    switzerland: "🇨🇭",
    norway: "🇳🇴",
    finland: "🇫🇮",
    poland: "🇵🇱",
    turkey: "🇹🇷",
    israel: "🇮🇱",
    egypt: "🇪🇬",
    usa: "🇺🇸",
    "united states": "🇺🇸",
    "united kingdom": "🇬🇧",
    britain: "🇬🇧",
    "great britain": "🇬🇧",
    france: "🇫🇷",
    spain: "🇪🇸",
    italy: "🇮🇹",
    netherlands: "🇳🇱",
    austria: "🇦🇹",
    japan: "🇯🇵",
    "south korea": "🇰🇷",
    korea: "🇰🇷",
    singapore: "🇸🇬",
    "new zealand": "🇳🇿",
    "south africa": "🇿🇦",
    brazil: "🇧🇷",
    mexico: "🇲🇽",
    argentina: "🇦🇷",
    russia: "🇷🇺",
    ukraine: "🇺🇦",
    "czech republic": "🇨🇿",
    czechia: "🇨🇿",
    slovakia: "🇸🇰",
    hungary: "🇭🇺",
    romania: "🇷🇴",
    bulgaria: "🇧🇬",
    greece: "🇬🇷",
    croatia: "🇭🇷",
    serbia: "🇷🇸",
    slovenia: "🇸🇮",
    portugal: "🇵🇹",
    sweden: "🇸🇪",
    denmark: "🇩🇰",
    irl: "🇮🇪",
    chn: "🇨🇳",
    hkg: "🇭🇰",
    tha: "🇹🇭",
    bel: "🇧🇪",
    ger: "🇩🇪",
    deu: "🇩🇪",
    aus: "🇦🇺",
    can: "🇨🇦",
    irn: "🇮🇷",
    mys: "🇲🇾",
    pak: "🇵🇰",
    ind: "🇮🇳",
    cyp: "🇨🇾",
    mlt: "🇲🇹",
    che: "🇨🇭",
    sui: "🇨🇭",
    nor: "🇳🇴",
    fin: "🇫🇮",
    pol: "🇵🇱",
    tur: "🇹🇷",
    isr: "🇮🇱",
    egy: "🇪🇬",
    gbr: "🇬🇧",
    fra: "🇫🇷",
    esp: "🇪🇸",
    ita: "🇮🇹",
    nld: "🇳🇱",
    aut: "🇦🇹",
    jpn: "🇯🇵",
    kor: "🇰🇷",
    sgp: "🇸🇬",
    nzl: "🇳🇿",
    zaf: "🇿🇦",
    bra: "🇧🇷",
    mex: "🇲🇽",
    arg: "🇦🇷",
    rus: "🇷🇺",
    ukr: "🇺🇦",
    cze: "🇨🇿",
    svk: "🇸🇰",
    hun: "🇭🇺",
    rou: "🇷🇴",
    bgr: "🇧🇬",
    grc: "🇬🇷",
    hrv: "🇭🇷",
    srb: "🇷🇸",
    svn: "🇸🇮",
    gb: "🇬🇧",
    ie: "🇮🇪",
    cn: "🇨🇳",
    hk: "🇭🇰",
    th: "🇹🇭",
    be: "🇧🇪",
    de: "🇩🇪",
    au: "🇦🇺",
    ca: "🇨🇦",
    ir: "🇮🇷",
    my: "🇲🇾",
    pk: "🇵🇰",
    in: "🇮🇳",
    cy: "🇨🇾",
    mt: "🇲🇹",
    ch: "🇨🇭",
    no: "🇳🇴",
    fi: "🇫🇮",
    pl: "🇵🇱",
    tr: "🇹🇷",
    il: "🇮🇱",
    eg: "🇪🇬",
    us: "🇺🇸",
    at: "🇦🇹",
    nl: "🇳🇱",
    fr: "🇫🇷",
    es: "🇪🇸",
    it: "🇮🇹",
    pt: "🇵🇹",
    se: "🇸🇪",
    dk: "🇩🇰",
    jp: "🇯🇵",
    kr: "🇰🇷",
    sg: "🇸🇬",
    nz: "🇳🇿",
    za: "🇿🇦",
    br: "🇧🇷",
    mx: "🇲🇽",
    ar: "🇦🇷",
    ru: "🇷🇺",
    ua: "🇺🇦",
    cz: "🇨🇿",
    sk: "🇸🇰",
    hu: "🇭🇺",
    ro: "🇷🇴",
    bg: "🇧🇬",
    gr: "🇬🇷",
    hr: "🇭🇷",
    rs: "🇷🇸",
    si: "🇸🇮",
  }

  const lookup = country.toLowerCase().trim()

  if (countryMap[lookup]) {
    return countryMap[lookup]
  }

  if (lookup.length === 2 && /^[a-z]{2}$/.test(lookup)) {
    const codePoints = [...lookup.toUpperCase()].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65)
    return String.fromCodePoint(...codePoints)
  }

  return ""
}

interface LiveMatchesProps {
  matches: Match[]
  isLoading: boolean
}

export function LiveMatches({ matches, isLoading }: LiveMatchesProps) {
  if (isLoading && matches.length === 0) {
    return (
      <Card className="bg-card border-border overflow-hidden">
        <div className="divide-y divide-border">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-4 w-48 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <Card className="bg-card border-border p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Circle className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No live matches at the moment</p>
          <p className="text-xs text-muted-foreground">Check back soon for live action</p>
        </div>
      </Card>
    )
  }

  // Determine match status category for sorting
  function getStatusPriority(match: Match): number {
    const infoNoticeLower = match.infoNotice?.toLowerCase() || ""
    const isInterval = match.infoNotice === "After first part."
    const isWithdrawnOrCancelled = infoNoticeLower.includes("withdrawn") || infoNoticeLower.includes("cancelled")
    const stage = match.eventStage?.toUpperCase() || ""

    if (!isInterval && !isWithdrawnOrCancelled && stage !== "SCHEDULED" && stage !== "FINISHED") return 0 // Live
    if (isInterval) return 1 // Interval
    if (stage === "SCHEDULED") return 2 // Scheduled
    return 3 // Finished / Withdrawn / Cancelled
  }

  // Sort matches by status priority first, then group by tournament within each priority
  const sortedMatches = [...matches].sort((a, b) => {
    const priorityDiff = getStatusPriority(a) - getStatusPriority(b)
    if (priorityDiff !== 0) return priorityDiff
    // Within same priority, group by tournament
    const tournA = a.tournamentName || ""
    const tournB = b.tournamentName || ""
    return tournA.localeCompare(tournB)
  })

  // Group sorted matches by status-tournament combo to show tournament headers correctly
  type MatchGroup = { tournament: string; statusPriority: number; matches: Match[] }
  const groups: MatchGroup[] = []
  for (const match of sortedMatches) {
    const tournament = match.tournamentName || "Snooker"
    const priority = getStatusPriority(match)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.tournament === tournament && lastGroup.statusPriority === priority) {
      lastGroup.matches.push(match)
    } else {
      groups.push({ tournament, statusPriority: priority, matches: [match] })
    }
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="divide-y divide-border">
        {groups.map((group, groupIndex) => (
          <div key={`${group.statusPriority}-${group.tournament}-${groupIndex}`}>
            {/* Tournament Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground uppercase tracking-wide">
                  {group.tournament}
                </span>
              </div>
            </div>

            {/* Matches */}
            <div className="divide-y divide-border">
              {group.matches.map((match, index) => {
                const matchId = match.eventId || `match-${index}`
                const homeName = match.homeName || "Player 1"
                const awayName = match.awayName || "Player 2"
                const homeScore = match.homeScore ?? "-"
                const awayScore = match.awayScore ?? "-"
                const homeFlag = getCountryFlag(match.participantCountry)
                const awayFlag = getCountryFlag(match.__FV__)
                const bestOf = match.bestOfFrames

                const isInterval = match.infoNotice === "After first part."
                const infoNoticeLower = match.infoNotice?.toLowerCase() || ""
                const isWithdrawnOrCancelled = infoNoticeLower.includes("withdrawn") || infoNoticeLower.includes("cancelled")

                let status = match.eventStage || "LIVE"
                if (isInterval) {
                  status = "INTERVAL"
                } else if (isWithdrawnOrCancelled && match.infoNotice) {
                  status = match.infoNotice
                }

                const isLive = !isInterval && !isWithdrawnOrCancelled && status !== "SCHEDULED" && status !== "FINISHED"
                const isScheduled = status === "SCHEDULED"
                const isFinished = status === "FINISHED" || isWithdrawnOrCancelled

                // Determine winner - "1" = home player, "2" = away player
                const homeWon = match.winner === "1"
                const awayWon = match.winner === "2"
                
                // For live matches, determine who is leading by score
                const homeScoreNum = Number.parseInt(homeScore) || 0
                const awayScoreNum = Number.parseInt(awayScore) || 0
                const homeLeading = isLive && homeScoreNum > awayScoreNum
                const awayLeading = isLive && awayScoreNum > homeScoreNum

                const formatStartTime = () => {
                  if (match.startDateTimeUtc) {
                    try {
                      const date = new Date(match.startDateTimeUtc)
                      if (!isNaN(date.getTime())) {
                        return date.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      }
                    } catch {
                      return null
                    }
                  }

                  if (match.startTime) {
                    try {
                      const date = new Date(Number.parseInt(match.startTime) * 1000)
                      if (!isNaN(date.getTime())) {
                        return date.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      }
                    } catch {
                      return null
                    }
                  }

                  return null
                }

                const formattedTime = isScheduled ? formatStartTime() : null

                return (
                  <div
                    key={matchId}
                    className={`flex ${isFinished ? "opacity-60" : ""}`}
                  >
                    {/* Status Column */}
                    <div className="w-20 flex-shrink-0 flex items-center justify-center border-r border-border py-2">
                      {isLive && (
                        <div className="flex items-center gap-1">
                          <Circle className="h-2 w-2 fill-live text-live animate-pulse" />
                          <span className="text-xs font-medium text-live">Live</span>
                        </div>
                      )}
                      {isInterval && (
                        <span className="text-xs font-medium text-amber-500">Interval</span>
                      )}
                      {isFinished && (
                        <span className="text-xs font-medium text-muted-foreground">
                          {isWithdrawnOrCancelled ? "W/O" : "Finished"}
                        </span>
                      )}
                      {isScheduled && formattedTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{formattedTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Players Column */}
                    <div className="flex-1 py-1 px-4">
                      {/* Home Player */}
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          {homeFlag && <span className="text-sm">{homeFlag}</span>}
                          <span className={`text-sm font-medium ${
                            homeWon ? "text-primary font-bold" : 
                            homeLeading ? "text-primary" : 
                            (awayWon || awayLeading) ? "text-muted-foreground" : 
                            "text-foreground"
                          }`}>{homeName}</span>
                        </div>
                        <span className={`text-sm font-bold tabular-nums w-6 text-right ${
                          homeWon ? "text-primary" : 
                          homeLeading ? "text-primary" : 
                          (awayWon || awayLeading) ? "text-muted-foreground" : 
                          "text-foreground"
                        }`}>
                          {homeScore}
                        </span>
                      </div>
                      {/* Away Player */}
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          {awayFlag && <span className="text-sm">{awayFlag}</span>}
                          <span className={`text-sm font-medium ${
                            awayWon ? "text-primary font-bold" : 
                            awayLeading ? "text-primary" : 
                            (homeWon || homeLeading) ? "text-muted-foreground" : 
                            "text-foreground"
                          }`}>{awayName}</span>
                        </div>
                        <span className={`text-sm font-bold tabular-nums w-6 text-right ${
                          awayWon ? "text-primary" : 
                          awayLeading ? "text-primary" : 
                          (homeWon || homeLeading) ? "text-muted-foreground" : 
                          "text-foreground"
                        }`}>
                          {awayScore}
                        </span>
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
  )
}
