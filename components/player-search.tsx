"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Search, X } from "lucide-react"

interface Match {
  homeName?: string
  awayName?: string
  [key: string]: unknown
}

interface PlayerSearchProps {
  liveMatches: Match[]
  upcomingMatches: Match[]
  onSearch: (query: string) => void
  searchQuery: string
}

export function PlayerSearch({ liveMatches, upcomingMatches, onSearch, searchQuery }: PlayerSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(searchQuery)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Build unique player names from all matches
  const allPlayers = useMemo(() => {
    const playerSet = new Set<string>()
    const allMatches = [...liveMatches, ...upcomingMatches]
    for (const match of allMatches) {
      if (match.homeName) playerSet.add(match.homeName)
      if (match.awayName) playerSet.add(match.awayName)
    }
    return Array.from(playerSet).sort()
  }, [liveMatches, upcomingMatches])

  // Filter suggestions based on input
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return []
    const query = inputValue.toLowerCase()
    return allPlayers
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 8)
  }, [inputValue, allPlayers])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Sync external searchQuery with internal input
  useEffect(() => {
    setInputValue(searchQuery)
    if (!searchQuery) {
      setIsOpen(false)
    }
  }, [searchQuery])

  function handleSelect(name: string) {
    setInputValue(name)
    onSearch(name)
    setShowSuggestions(false)
  }

  function handleInputChange(value: string) {
    setInputValue(value)
    setShowSuggestions(value.trim().length > 0)
    // Apply search immediately as user types
    onSearch(value)
  }

  function handleClear() {
    setInputValue("")
    onSearch("")
    setShowSuggestions(false)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 h-9 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Search players"
      >
        <Search className="h-4 w-4" />
        <span className="text-sm hidden sm:inline">Player Search</span>
      </button>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-1.5">
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => inputValue.trim() && setShowSuggestions(true)}
          placeholder="Search player..."
          className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-36 sm:w-48"
        />
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
          {suggestions.map((name) => {
            // Find which match(es) this player is in
            const allMatches = [...liveMatches, ...upcomingMatches]
            const playerMatch = allMatches.find(
              (m) =>
                m.homeName?.toLowerCase() === name.toLowerCase() ||
                m.awayName?.toLowerCase() === name.toLowerCase()
            )
            const opponent =
              playerMatch?.homeName?.toLowerCase() === name.toLowerCase()
                ? playerMatch?.awayName
                : playerMatch?.homeName

            return (
              <button
                key={name}
                type="button"
                onClick={() => handleSelect(name)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between"
              >
                <span className="text-foreground font-medium truncate">{name}</span>
                {opponent && (
                  <span className="text-xs text-muted-foreground ml-2 truncate">
                    vs {opponent}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
