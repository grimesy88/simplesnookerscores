import { NextResponse } from "next/server"

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, email, message } = body

    if (!type || !message) {
      return NextResponse.json(
        { error: "Type and message are required" },
        { status: 400 }
      )
    }

    if (!["problem", "suggestion"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid feedback type" },
        { status: 400 }
      )
    }

    if (!DISCORD_WEBHOOK_URL) {
      console.error("DISCORD_WEBHOOK_URL is not set")
      return NextResponse.json(
        { error: "Feedback service not configured" },
        { status: 500 }
      )
    }

    const color = type === "problem" ? 0xff4444 : 0x44bb44
    const title = type === "problem" ? "Bug Report" : "Suggestion"

    const embed = {
      title,
      color,
      fields: [
        {
          name: "Email",
          value: email || "Not provided",
          inline: true,
        },
        {
          name: "Type",
          value: type.charAt(0).toUpperCase() + type.slice(1),
          inline: true,
        },
        {
          name: "Message",
          value: message,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Simple Snooker Scores Feedback",
      },
    }

    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
      }),
    })

    if (!discordResponse.ok) {
      console.error("Discord webhook error:", discordResponse.status)
      return NextResponse.json(
        { error: "Failed to send feedback" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
