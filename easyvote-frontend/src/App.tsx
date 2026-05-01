import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { AppRouter } from "./routes/AppRouter"
import { AuroraBackground } from "./components/effects/AuroraBackground"
import { ThemeProvider } from "next-themes"

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuroraBackground />
          <AppRouter />
          <Toaster theme="dark" position="top-right" richColors />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
