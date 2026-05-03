import { FloatingOrbs } from "@/components/effects/FloatingOrbs"
import FeaturedCandidates from "@/components/layouts/FeaturedCandidates"
import FeaturesSection from "@/components/layouts/FeaturesSection"
import Footer from "@/components/layouts/Footer"
import HeroSection from "@/components/layouts/HeroSection"
import HowItWorksSection from "@/components/layouts/HowItWorksSection"
import LiveElections from "@/components/layouts/LiveElections"
import Navbar from "@/components/layouts/Navbar"
import RealTimeStats from "@/components/layouts/RealTimeStats"
import TeamSection from "@/components/layouts/TeamSection"
import TestimonialsSection from "@/components/layouts/TestimonialsSection"
import { Button } from "@/components/ui/button"
import { LanguageContext } from "@/i18n"
import { ChevronDown, Globe, Check } from "lucide-react"
import { useContext, useState, useEffect, useRef } from "react"

export default function HomePage() {
  const { language: currentLanguage, setLanguage } = useContext(LanguageContext);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lng: string) => {
    setLanguage(lng);
    setShowLanguageDropdown(false);

    // Optional: Add ripple effect
    const button = document.querySelector(`[data-language="${lng}"]`);
    if (button) {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: var(--primary);
        transform: scale(0);
        animation: ripple 0.6s linear;
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      button.appendChild(ripple);
      const rect = button.getBoundingClientRect();
      ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
      ripple.style.left = (rect.width / 2 - parseFloat(ripple.style.width) / 2) + 'px';
      ripple.style.top = (rect.height / 2 - parseFloat(ripple.style.height) / 2) + 'px';
      setTimeout(() => ripple.remove(), 600);
    }
  };

  const languages = [
    { value: 'fr', label: 'Français', flag: '🇫🇷', color: 'text-blue-500' },
    { value: 'en', label: 'English', flag: '🇺🇸', color: 'text-red-500' },
  ];

  const currentLanguageInfo = languages.find(lang => lang.value === currentLanguage) || languages[0];

  return (
    <div className="min-h-screen overflow-hidden">
      <FloatingOrbs />
      <Navbar />

      {/* Language Switcher with Dropdown */}
      <div className="fixed bottom-6 right-6 z-50" ref={dropdownRef}>
        {/* Main Button */}
        <Button
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl px-4 py-3 gap-2 hover:bg-background/90 transition-all duration-300"
        >
          <Globe className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">
            {currentLanguageInfo.value.toUpperCase()}
          </span>
          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
        </Button>

        {/* Dropdown Menu */}
        {showLanguageDropdown && (
          <div className="absolute bottom-full right-0 mb-2 min-w-[160px] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.value}
                data-language={lang.value}
                onClick={() => changeLanguage(lang.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200
                  hover:bg-primary/10 group
                  ${currentLanguage === lang.value ? 'bg-primary/5' : ''}
                `}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className={`flex-1 text-sm font-medium ${currentLanguage === lang.value ? 'text-primary' : 'text-foreground'}`}>
                  {lang.label}
                </span>
                {currentLanguage === lang.value && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="relative py-4">
        <HeroSection />
        <HowItWorksSection />
        <FeaturedCandidates />
        <LiveElections />
        <FeaturesSection />
        <RealTimeStats />
        <TestimonialsSection />
        <TeamSection/>
        <Footer />
      </section>
    </div>
  );
}