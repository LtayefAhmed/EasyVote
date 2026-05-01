import React from "react"
import { Link } from "react-router-dom"
import { ROUTES } from "@/lib/constants"
import { AuroraBackground } from "@/components/effects/AuroraBackground"

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center text-center p-4">
      <AuroraBackground />
      <div className="glass-dark p-12 rounded-2xl max-w-md w-full relative z-10 shadow-2xl">
        <h1 className="text-8xl font-display font-bold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page non trouvée</h2>
        <p className="text-muted-foreground mb-8">
          Il semblerait que vous vous soyez perdu dans l'isoloir.
        </p>
        <Link 
          to={ROUTES.HOME}
          className="inline-block px-6 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
