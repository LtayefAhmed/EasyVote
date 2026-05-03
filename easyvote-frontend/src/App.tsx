import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { AppRouter } from "./routes/AppRouter"
import { AuroraBackground } from "./components/effects/AuroraBackground"
import { ThemeProvider } from "./contexts/ThemeProvider"
import { LanguageProvider } from "./i18n"
import SplashCursor from "./components/ui/SplashCursor"

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider className="min-h-screen" attribute="class" defaultTheme="system">
      <SplashCursor
        DENSITY_DISSIPATION={2.5}
        VELOCITY_DISSIPATION={1}
        PRESSURE={0.05}
        CURL={0}
        SPLAT_RADIUS={0.07}
        SPLAT_FORCE={2000}
        COLOR_UPDATE_SPEED={2}
        SHADING
        RAINBOW_MODE={false}
        COLOR="#3b3cfd"
      />
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuroraBackground />
            <AppRouter />
            <Toaster theme="dark" position="top-right" richColors />
          </BrowserRouter>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
