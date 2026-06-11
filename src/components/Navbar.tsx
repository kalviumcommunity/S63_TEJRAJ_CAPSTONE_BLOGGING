import { useState, useEffect } from "react";
import { Search, Moon, Sun, Menu, X, ArrowRight, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "firebase/auth";

interface NavbarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentTheme: "light" | "dark";
  setCurrentTheme: (theme: "light" | "dark") => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenProfile: () => void;
}

export default function Navbar({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  currentTheme,
  setCurrentTheme,
  user,
  onSignIn,
  onSignOut,
  onOpenProfile
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customAvatar, setCustomAvatar] = useState("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80");

  useEffect(() => {
    const loadCustomAvatar = () => {
      const saved = localStorage.getItem("futurescope_user_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const syncGoogle = parsed.syncGoogle !== undefined ? parsed.syncGoogle : true;
          if (syncGoogle && user?.photoURL) {
            setCustomAvatar(user.photoURL);
          } else if (parsed.avatarUrl) {
            setCustomAvatar(parsed.avatarUrl);
          }
        } catch (e) {}
      } else if (user?.photoURL) {
        setCustomAvatar(user.photoURL);
      }
    };
    loadCustomAvatar();
    window.addEventListener("futurescope_profile_updated", loadCustomAvatar);
    return () => window.removeEventListener("futurescope_profile_updated", loadCustomAvatar);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    { label: "All", id: "all" },
    { label: "AI", id: "AI" },
    { label: "Technology", id: "Technology" },
    { label: "Programming", id: "Programming" },
    { label: "Startups", id: "Startups" },
    { label: "Cybersecurity", id: "Cybersecurity" },
    { label: "Tutorials", id: "Tutorials" }
  ];

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-editorial/85 dark:bg-darkBg/85 backdrop-blur-md py-3 border-b border-gray-200 dark:border-neutral-800 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="flex items-center space-x-2 text-left group"
          >
            <div className="bg-darkBg dark:bg-accentNeon text-accentNeon dark:text-darkBg p-1.5 rounded-sm transition-transform group-hover:rotate-12">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-2xl font-black tracking-tight text-darkBg dark:text-editorial">
                Future<span className="italic font-bold text-neutral-600 dark:text-neutral-400">Scope</span>
              </span>
              <div className="hidden sm:block text-[9px] font-mono tracking-widest text-neutral-500 uppercase -mt-1">
                Aesthetic Digital Magazine
              </div>
            </div>
          </button>
        </div>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveCategory(item.id);
                  // Scroll slightly down to grid, or let user explore
                  const targetGrid = document.getElementById("articles-anchor");
                  if (targetGrid) {
                    targetGrid.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className={`px-3 py-1.5 text-sm font-medium transition-colors relative rounded-full ${
                  isActive
                    ? "text-darkBg dark:text-darkBg font-semibold"
                    : "text-neutral-600 hover:text-darkBg dark:text-neutral-400 dark:hover:text-editorial"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 bg-accentNeon rounded-full z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* ACTIONS RIGHT */}
        <div className="flex items-center space-x-3">
          {/* SEARCH BAR WIDGET */}
          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 180, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-darkBg dark:text-editorial px-3 py-1.5 pr-8 rounded-full focus:outline-none focus:border-darkBg dark:focus:border-accentNeon w-40"
                />
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-darkBg dark:hover:text-editorial rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
              aria-label="Search articles"
              id="btn-navbar-search"
            >
              {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
          </div>

          {/* DARK/LIGHT THEME SWITCHER */}
          <button
            onClick={toggleTheme}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-darkBg dark:hover:text-editorial rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
            aria-label="Toggle theme"
            id="btn-navbar-theme"
          >
            {currentTheme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* SUBSCRIBE CTA */}
          <button
            onClick={() => {
              const newsletterSec = document.getElementById("newsletter-section");
              if (newsletterSec) {
                newsletterSec.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="hidden sm:flex items-center space-x-1.5 bg-darkBg text-editorial dark:bg-accentNeon dark:text-darkBg text-xs font-semibold px-4 py-2 rounded-full hover:opacity-90 dark:hover:bg-hoverNeon transition-all cursor-pointer shadow-sm active:scale-95"
            id="btn-navbar-subscribe"
          >
            <span>Subscribe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* GOOGLE AUTHENTICATION SYSTEM (LOGIN ONLY) */}
          {!user && (
            <button
              onClick={onSignIn}
              className="flex items-center space-x-1.5 bg-white dark:bg-neutral-900 border border-neutral-350 dark:border-neutral-750 text-neutral-700 dark:text-editorial text-xs font-semibold px-4.5 py-2 rounded-full hover:border-darkBg dark:hover:border-accentNeon hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-all cursor-pointer shadow-sm active:scale-95"
              id="btn-navbar-signin"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6-4.53z"
                />
              </svg>
              <span>Login</span>
            </button>
          )}

          {/* PROFILE SYSTEM COMPONENT BUTTON */}
          <button
            onClick={onOpenProfile}
            className="relative p-0.5 rounded-full hover:scale-110 transition-transform duration-200 cursor-pointer group/avatar-btn flex items-center justify-center shrink-0"
            title="Open Secure Terminal Profile"
            id="btn-navbar-profile"
          >
            <span className="absolute inset-0 rounded-full border border-accentNeon/40 group-hover/avatar-btn:scale-115 group-hover/avatar-btn:border-accentNeon transition-all animate-pulse" />
            <img
              src={customAvatar}
              alt="Profile"
              className="w-7 h-7 rounded-full object-cover border border-neutral-350 dark:border-neutral-800 relative z-10"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80";
              }}
            />
          </button>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-darkBg dark:hover:text-editorial rounded-full"
            aria-label="Toggle menu"
            id="btn-navbar-mobile-toggle"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-editorial dark:bg-darkBg border-b border-gray-200 dark:border-neutral-800 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col space-y-2">
              <div className="text-xs font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest pb-1 border-b border-gray-200 dark:border-neutral-800 mb-2">
                Magazine Issues
              </div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveCategory(item.id);
                    setIsMobileMenuOpen(false);
                    const targetGrid = document.getElementById("articles-anchor");
                    if (targetGrid) {
                      targetGrid.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className={`text-left py-2 px-3 text-sm rounded-md transition-colors ${
                    activeCategory === item.id
                      ? "bg-accentNeon/20 text-darkBg dark:text-editorial font-semibold border-l-4 border-accentNeon"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    const newsletterSec = document.getElementById("newsletter-section");
                    if (newsletterSec) {
                      newsletterSec.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="w-full text-center flex items-center justify-center space-x-2 bg-darkBg text-editorial dark:bg-accentNeon dark:text-darkBg py-2 rounded-md font-semibold text-xs"
                >
                  <span>Connect & Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
