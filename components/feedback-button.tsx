"use client"

import React from "react"

import { useState } from "react"
import { MessageSquare, AlertCircle, Lightbulb, X, Send, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type FeedbackType = "problem" | "suggestion" | null

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackType || !message.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType,
          email: email.trim() || null,
          message: message.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      setSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
        setFeedbackType(null)
        setEmail("")
        setMessage("")
        setSubmitted(false)
      }, 2000)
    } catch {
      setError("Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setFeedbackType(null)
    setEmail("")
    setMessage("")
    setError(null)
    setSubmitted(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <MessageSquare className="h-4 w-4" />
        <span className="hidden sm:inline">Feedback</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 p-4 z-50 bg-card border-border shadow-lg">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium text-foreground">Thank you!</p>
              <p className="text-sm text-muted-foreground mt-1">Your feedback has been submitted.</p>
            </div>
          ) : !feedbackType ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-foreground">Send Feedback</h3>
                <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <button
                onClick={() => setFeedbackType("problem")}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left"
              >
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Report a problem</p>
                  <p className="text-xs text-muted-foreground">Something not working correctly?</p>
                </div>
              </button>
              <button
                onClick={() => setFeedbackType("suggestion")}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Suggest an improvement</p>
                  <p className="text-xs text-muted-foreground">Have an idea to make this better?</p>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setFeedbackType(null)}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ChevronDown className="h-3 w-3 rotate-90" />
                  Back
                </button>
                <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {feedbackType === "problem" ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <Lightbulb className="h-5 w-5 text-primary" />
                )}
                <h3 className="font-medium text-foreground">
                  {feedbackType === "problem" ? "Report a problem" : "Suggest an improvement"}
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="email" className="text-sm text-muted-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm text-muted-foreground">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="message"
                    placeholder={feedbackType === "problem" 
                      ? "Describe the issue you're experiencing..." 
                      : "Share your suggestion..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 min-h-[100px] resize-none"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isSubmitting || !message.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          )}
        </Card>
      )}
    </div>
  )
}
