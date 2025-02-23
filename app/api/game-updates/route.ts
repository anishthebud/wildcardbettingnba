import { NextResponse } from "next/server"

export async function GET() {
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const fetchGameState = async () => {
        try {
          const response = await fetch("http://localhost:5001/api/game-state")
          const gameState = await response.json()

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(gameState)}\n\n`))
        } catch (error) {
          console.error("Failed to fetch game state:", error)
        }
      }

      // Send initial update
      await fetchGameState()

      // Send updates every 3 seconds
      const interval = setInterval(fetchGameState, 3000)

      // Cleanup
      return () => {
        clearInterval(interval)
      }
    },
  })

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
