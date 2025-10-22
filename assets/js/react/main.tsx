import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"

const container = document.getElementById("react-root") as HTMLDivElement | null
if (container) {
  const { userId, csrf, styleUrl } = container.dataset as {
    userId?: string
    csrf?: string
    styleUrl?: string
  }

  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <App
        userId={userId ? parseInt(userId, 10) : undefined}
        csrfToken={csrf}
        styleUrl={styleUrl}
      />
    </React.StrictMode>
  )
}


