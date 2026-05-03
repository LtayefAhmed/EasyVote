import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, LogIn, UserPlus, Menu, X, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTranslation } from "@/i18n";

export default function Navbar() {
  const [isMobileOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const toggleMobileMenu = () => setIsOpen(!isMobileOpen);
  const closeMobileMenu = () => setIsOpen(false);

  const navLinks = [
    { name: t("navbar.home"), href: "/", path: "/" },
    { name: t("navbar.elections"), href: "/elections", path: "/elections" },
    { name: t("navbar.delegates"), href: "/delegates", path: "/delegates" },
    { name: t("navbar.guide"), href: "/guide", path: "/guide" },
    { name: t("navbar.results"), href: "/results", path: "/results" },
    { name: t("navbar.contact"), href: "/contact", path: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path;
  };

  return (
    <>
      <header className="w-full z-50 fixed top-0">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-2 md:py-3">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
              className={`
                flex items-center justify-between w-full 
                px-3 sm:px-5 md:px-7 
                py-2 sm:py-2.5 md:py-3 
                rounded-2xl transition-all duration-300
                ${isScrolled
                  ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl border border-white/20 dark:border-gray-800/50"
                  : "bg-white/80 dark:bg-gray-900/60 backdrop-blur-md shadow-lg border border-white/20 dark:border-gray-800/30"
                }
              `}
            >
              {/* Logo */}
              <Link
                to="/"
                className="flex items-center cursor-pointer group shrink-0 gap-2"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <Vote className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                  <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    EasyVote
                  </span>
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Link
                      to={link.path}
                      className={`
                        relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200
                        ${isActive(link.path)
                          ? "text-pink-600 dark:text-pink-400"
                          : "text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400"
                        }
                      `}
                    >
                      {link.name}
                      {isActive(link.path) && (
                        <motion.span
                          layoutId="activeTab"
                          className="absolute inset-x-2 bottom-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      {!isActive(link.path) && (
                        <span className="absolute inset-x-2 bottom-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Right Side Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0"
              >
                {/* Theme Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 rounded-xl transition-all duration-200"
                  aria-label="Toggle theme"
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: theme === "dark" ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  </motion.div>
                </motion.button>

                {/* Login Button */}
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 rounded-xl transition-all duration-200"
                  >
                    <LogIn size={16} />
                    <span>{t("navbar.login")}</span>
                  </motion.button>
                </Link>

                {/* Register CTA */}
                <Link to="/register">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="relative px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 group overflow-hidden text-sm">
                      <span className="relative z-10 flex items-center gap-2">
                        <UserPlus size={14} />
                        <span>{t("navbar.register")}</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </Link>

                {/* Mobile Menu Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMobileMenu}
                  className="lg:hidden p-2 rounded-xl bg-pink-50 dark:bg-pink-950/30 hover:bg-pink-100 dark:hover:bg-pink-950/50 transition-all duration-200"
                  aria-label="Toggle mobile menu"
                >
                  <AnimatePresence mode="wait">
                    {isMobileOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={closeMobileMenu}
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative flex flex-col w-4/5 max-w-sm h-full 
                bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
                shadow-2xl border-r border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-200 dark:border-gray-800">
                <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2">
                  <Vote className="w-7 h-7 text-pink-600" />
                  <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    EasyVote
                  </span>
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <ul className="flex flex-col gap-2">
                  {navLinks.map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={closeMobileMenu}
                        className={`
                          flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                          ${isActive(link.path)
                            ? "text-pink-600 dark:text-pink-400 font-semibold bg-pink-50 dark:bg-pink-950/20"
                            : "text-gray-700 dark:text-gray-300 font-medium hover:text-pink-600 dark:hover:text-pink-400"
                          }
                        `}
                      >
                        <span>{link.name}</span>
                        {isActive(link.path) && (
                          <motion.div
                            layoutId="mobileActive"
                            className="w-1.5 h-1.5 rounded-full bg-pink-500"
                          />
                        )}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="p-5 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30">
                    <LogIn size={16} className="mr-2" />
                    {t("navbar.login")}
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMobileMenu}>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                    <UserPlus size={16} className="mr-2" />
                    {t("navbar.register")}
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                  © {new Date().getFullYear()} EasyVote
                  <br />
                  Plateforme de vote universitaire
                </p>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}