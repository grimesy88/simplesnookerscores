import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    const supabase = await createClient()

    const { error } = await supabase.from("feedback").insert({
      type,
      email: email || null,
      message,
    })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to save feedback" },
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
