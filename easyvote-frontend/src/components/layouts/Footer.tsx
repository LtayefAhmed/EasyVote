// components/layouts/Footer.tsx
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Mail, MapPin, Phone, Clock, Vote, Shield, Award, Heart } from "lucide-react"
import { useTranslation } from "@/i18n"

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: t("navbar.home"), href: "/" },
    { name: t("navbar.elections"), href: "/elections" },
    { name: t("navbar.delegates"), href: "/delegates" },
    { name: t("navbar.guide"), href: "/guide" },
    { name: t("navbar.results"), href: "/results" },
    { name: t("navbar.contact"), href: "/contact" }
  ]

  const legalLinks = [
    { name: t("footer.privacy"), href: "/privacy" },
    { name: t("footer.terms"), href: "/terms" },
    { name: t("footer.legal"), href: "/legal" }
  ]

  return (
    <footer className="relative bg-gray-900 dark:bg-black text-white">
      {/* Gradient Border Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Main Footer */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Vote className="w-8 h-8 text-pink-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                EasyVote
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t("hero.quote")}
            </p>
            <div className="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <i className="fa fa-github" aria-hidden="true" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <i className="fa fa-twitter" aria-hidden="true" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <i className="fa fa-linkedin" aria-hidden="true"></i>
              </a>
              <a href="mailto:contact@easyvote.com"
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4">{t("footer.quick_links")}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-pink-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-2">
              {legalLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-pink-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4">{t("footer.contact_us")}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-pink-500" />
                <span>123 University Ave, Campus Center</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-pink-500" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-pink-500" />
                <span>contact@easyvote.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Clock className="w-4 h-4 text-pink-500" />
                <span>Support 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 py-6 border-t border-gray-800 mb-6"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-400">{t("stats.anonymity")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-400">{t("stats.students")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Vote className="w-4 h-4 text-pink-500" />
            <span className="text-sm text-gray-400">+50K votes traités</span>
          </div>
        </motion.div>

        {/* Copyright */}
        <div className="text-center pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            © {currentYear} EasyVote. {t("footer.copyright")}
          </p>
          <p className="text-gray-600 text-xs mt-2 flex items-center justify-center gap-1">
            {t("footer.made_with")} <Heart className="w-3 h-3 text-red-500 animate-pulse" /> {t("footer.by_team")}
          </p>
        </div>
      </div>
    </footer>
  )
}