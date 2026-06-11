import React, { useState, useEffect } from "react";
import { articles, authors, podcastEpisodes, discussions, categories } from "./data/blogData";
import { Article, Author } from "./types";
import Navbar from "./components/Navbar";
import ArticleModal from "./components/ArticleModal";
import PodcastSection from "./components/PodcastSection";
import CommunitySection from "./components/CommunitySection";
import ProfileDrawer from "./components/ProfileDrawer";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import {
  ArrowUpRight,
  TrendingUp,
  Clock,
  Heart,
  Calendar,
  Sparkles,
  ArrowRight,
  Mail,
  Linkedin,
  Twitter,
  Github,
  Award,
  BookOpen,
  ChevronRight,
  AlertCircle,
  History
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";

export default function App() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [likedArticles, setLikedArticles] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("dark");
  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Firebase Sign In Error: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Firebase Sign Out Error: ", error);
    }
  };

  // Recently Read State
  const [recentlyRead, setRecentlyRead] = useState<Article[]>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("futurescope_recently_read");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  const [newsletterResponse, setNewsletterResponse] = useState<{ message: string; prediction?: string } | null>(null);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  // Pagination for infinite blog feed simulation
  const [visibleCount, setVisibleCount] = useState(3);
  const [isFinishingFeed, setIsFinishingFeed] = useState(false);

  // Sync dark class on mount
  useEffect(() => {
    // Defaults to Elegant Dark theme layout
    document.documentElement.classList.add("dark");
  }, []);

  // Track recently read articles during session
  useEffect(() => {
    if (selectedArticle) {
      setRecentlyRead(prev => {
        const filtered = prev.filter(art => art.id !== selectedArticle.id);
        const updated = [selectedArticle, ...filtered].slice(0, 3);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("futurescope_recently_read", JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [selectedArticle]);

  const handleLikeArticle = (id: string) => {
    if (likedArticles.includes(id)) {
      setLikedArticles(prev => prev.filter(item => item !== id));
    } else {
      setLikedArticles(prev => [...prev, id]);
    }
  };

  // Filter Articles based on Category selection and Search query
  const filteredArticles = articles.filter(art => {
    const matchesCategory = activeCategory === "all" || art.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = articles[0]; // Pulse of tomorrow main hero
  const trendingArticles = articles.slice(1, 4); // Grid top cards

  const handleSubscribeNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;

    setIsNewsletterSubmitting(true);
    setNewsletterError(null);
    setNewsletterResponse(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Subscription rejected by mail engine.");
      }

      setNewsletterResponse({
        message: data.message,
        prediction: data.prediction
      });
      setNewsletterEmail("");
    } catch (err: any) {
      console.error(err);
      setNewsletterError(err.message || "Newsletter service temporarily unavailable.");
    } finally {
      setIsNewsletterSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    setIsFinishingFeed(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 3, filteredArticles.length));
      setIsFinishingFeed(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-editorial dark:bg-darkBg text-darkBg dark:text-editorial selection:bg-accentNeon transition-colors duration-300 mesh-glow pb-0">
      
      {/* 1. Navbar Navigation */}
      <Navbar
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setActiveCategory(cat);
          setSearchQuery(""); // Reset search on category swap
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <div className="pt-24 space-y-16">

        {/* 2. HERO FEATURED SECTION */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-4 md:mt-8">
          <div className="relative rounded-2xl overflow-hidden border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 group">
            {/* Split viewport layout on large screens, full cover on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[500px]">
              
              {/* Image Column */}
              <div className="lg:col-span-7 relative h-[250px] sm:h-[350px] lg:h-auto overflow-hidden">
                <img
                  src={featuredArticle.cover}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  id="hero-article-cover"
                />
                {/* Visual gradient masking */}
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-neutral-950 via-neutral-950/20 to-transparent" />
                
                {/* Floating dynamic launch sticker */}
                <div className="absolute top-4 left-4 bg-accentNeon text-darkBg px-3 py-1 text-[9px] font-mono font-black uppercase tracking-wider rounded-sm shadow-md">
                  FEATURE ISSUE
                </div>
              </div>

              {/* Headline Information Column */}
              <div className="lg:col-span-5 p-6 md:p-12 flex flex-col justify-between bg-black text-white relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-accentNeon uppercase tracking-widest font-black">
                      // {featuredArticle.category}
                    </span>
                    <span className="text-neutral-500 font-mono text-[9px]">•</span>
                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-accentNeon" />
                      <span>{featuredArticle.readTime} reading curve</span>
                    </span>
                  </div>

                  <h1 className="font-serif text-3xl md:text-5xl font-black text-white leading-tight tracking-tight hover:text-accentNeon transition-colors cursor-pointer"
                      onClick={() => setSelectedArticle(featuredArticle)}
                  >
                    {featuredArticle.title}
                  </h1>

                  <p className="text-neutral-400 font-light text-sm md:text-base leading-relaxed line-clamp-3">
                    {featuredArticle.description}
                  </p>
                </div>

                {/* Meter card metadata */}
                <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 text-xs">
                    <img
                      src={featuredArticle.author.avatar}
                      alt={featuredArticle.author.name}
                      className="w-10 h-10 rounded-full border-2 border-accentNeon object-cover"
                    />
                    <div>
                      <div className="font-semibold text-white">{featuredArticle.author.name}</div>
                      <div className="text-[10px] text-neutral-500 font-mono uppercase">{featuredArticle.date}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedArticle(featuredArticle)}
                    className="flex items-center space-x-2 bg-accentNeon text-darkBg text-xs font-bold px-4 py-2.5 rounded-full hover:bg-hoverNeon transition-all cursor-pointer group active:scale-95 shadow-lg shadow-accentNeon/5"
                    id="btn-hero-read-more"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. TRENDING ARTICLES GRID (3 Columns Desktop, 2 Tablet, 1 Mobile) */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
          <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-neutral-800 pb-3">
            <TrendingUp className="w-5 h-5 text-accentNeon" />
            <h2 className="font-serif text-xl md:text-2xl font-black tracking-tight text-darkBg dark:text-editorial">
              Trending Speculations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {trendingArticles.map((art) => {
              const isLiked = likedArticles.includes(art.id);
              return (
                <div
                  key={art.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group cursor-pointer"
                  onClick={() => setSelectedArticle(art)}
                  id={`trending-card-${art.id}`}
                >
                  <div className="space-y-4">
                    {/* Cover Frame */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={art.cover}
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-550 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 bg-darkBg text-editorial dark:bg-accentNeon dark:text-darkBg font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                        {art.category}
                      </span>
                    </div>

                    {/* Meta & Info */}
                    <div className="px-5 space-y-2">
                      <div className="flex items-center space-x-3 text-[10px] text-neutral-500 font-mono">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-accentNeon" />
                          <span>{art.readTime}</span>
                        </span>
                        <span>•</span>
                        <span>By {art.author.name}</span>
                      </div>
                      <h3 className="font-serif text-lg md:text-xl font-bold font-semibold text-darkBg dark:text-editorial leading-snug group-hover:text-accentNeon transition-colors line-clamp-2">
                        {art.title}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light line-clamp-2">
                        {art.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-5 py-4 mt-4 border-t border-gray-100 dark:border-neutral-800/65 flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span className="text-[10px]">{art.date}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid popping modal when clicking like
                        handleLikeArticle(art.id);
                      }}
                      className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${isLiked ? "text-red-500 font-bold" : ""}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      <span>{art.likes + (isLiked ? 1 : 0)} Likes</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Anchor point to target when clicking category navigation */}
        <div id="articles-anchor" />

        {/* 4. DYNAMIC FEED WITH Curated CATEGORIES */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
          
          {/* Header Title + Category Pill bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gray-250 dark:border-neutral-800">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl md:text-3xl font-black text-darkBg dark:text-editorial">
                The Curated Feed
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Explore tech briefs dynamically matching editorial criteria.
              </p>
            </div>

            {/* Quick Pills selector */}
            <div className="flex flex-wrap gap-1.5 max-w-full">
              {["all", "AI", "Technology", "Programming", "Startups", "Cybersecurity", "Tutorials"].map((pill) => {
                const isSelected = activeCategory.toLowerCase() === pill.toLowerCase();
                return (
                  <button
                    key={pill}
                    onClick={() => setActiveCategory(pill.toLowerCase())}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      isSelected
                        ? "bg-accentNeon border-accentNeon text-darkBg font-bold shadow-sm"
                        : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 hover:border-darkBg dark:hover:border-editorial text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {pill === "all" ? "Aesthetic Feed" : pill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Layout Filter Results */}
          {filteredArticles.length === 0 ? (
            <div className="mx-auto py-16 text-center space-y-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-xl max-w-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-accentNeon/10 text-accentNeon flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6 text-accentNeon" />
              </div>
              <h3 className="font-serif text-lg font-bold text-darkBg dark:text-editorial">
                Search indices silent
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 px-6 max-w-md mx-auto leading-relaxed">
                No articles matching "{searchQuery || activeCategory}" compiled inside current editorial batch. Select another category chip above to reset results.
              </p>
            </div>
          ) : (
            <LayoutGroup id="curated-feed-group">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredArticles.slice(0, visibleCount).map((art) => {
                  const isLiked = likedArticles.includes(art.id);
                  return (
                    <motion.div
                      layout
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4 shadow-sm hover:shadow-md hover:border-neutral-350 dark:hover:border-neutral-700 hover:-translate-y-0.5 transition-all cursor-pointer group"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800">
                        <img
                          src={art.cover}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 bg-accentNeon text-darkBg text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase">
                          {art.category}
                        </span>
                      </div>

                      <div className="space-y-2 text-left">
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                          <span>{art.date}</span>
                          <span className="flex items-center space-x-0.5">
                            <Clock className="w-3 h-3 text-accentNeon" />
                            <span>{art.readTime}</span>
                          </span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-darkBg dark:text-editorial leading-snug group-hover:text-accentNeon transition-colors line-clamp-2">
                          {art.title}
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light line-clamp-2">
                          {art.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span className="flex items-center space-x-1">
                          <img
                            src={art.author.avatar}
                            alt={art.author.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-neutral-600 dark:text-neutral-300 font-sans text-xs">{art.author.name}</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeArticle(art.id);
                          }}
                          className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${isLiked ? "text-red-500 font-bold" : ""}`}
                        >
                          <Heart className="w-3 h-3" />
                          <span>{art.likes + (isLiked ? 1 : 0)} L</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </LayoutGroup>
          )}

          {/* Simulation of Infinite Scroll / Paginated load button */}
          {filteredArticles.length > visibleCount && (
            <div className="pt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isFinishingFeed}
                className="inline-flex items-center space-x-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-850 hover:border-darkBg dark:hover:border-editorial text-xs font-bold px-6 py-3 rounded-full shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isFinishingFeed ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-t-accentNeon border-neutral-400 rounded-full animate-spin" />
                    <span>Synchronizing articles feed...</span>
                  </>
                ) : (
                  <>
                    <span>Decrypt more editorial entries</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* 5. AUTHOR SPOTLIGHT SECTION */}
        <section className="bg-white dark:bg-[#111111]/40 border-y border-neutral-200 dark:border-neutral-900 py-16 px-4 md:px-8">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="text-center md:text-left space-y-2 pb-4 border-b border-gray-150 dark:border-neutral-800">
              <span className="font-mono text-xs uppercase tracking-widest text-accentNeon font-bold flex items-center justify-center md:justify-start space-x-1.5">
                <Award className="w-4 h-4 text-accentNeon" />
                <span>Editorial Council</span>
              </span>
              <h2 className="font-serif text-2xl md:text-4xl font-black text-darkBg dark:text-editorial leading-tight">
                Featured Visionary Council
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">
                Our leading writers hold computer science doctorates and operational venture experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {authors.map((auth) => (
                <div
                  key={auth.id}
                  className="bg-white dark:bg-neutral-900 p-6 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4 hover:shadow-lg hover:border-neutral-300 dark:hover:border-accentNeon/50 transition-all cursor-default text-center group"
                >
                  <div className="relative w-20 h-20 mx-auto">
                    <img
                      src={auth.avatar}
                      alt={auth.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-accentNeon ring-4 ring-neutral-100 dark:ring-neutral-850 transition-transform group-hover:scale-105"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-darkBg text-accentNeon p-1 rounded-full border border-neutral-800 text-[8px] font-mono font-black select-none">
                      PRO
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif text-lg font-bold text-darkBg dark:text-editorial">
                      {auth.name}
                    </h4>
                    <p className="text-xs text-accentNeon font-mono font-semibold uppercase">
                      {auth.role}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono italic">
                      Specialty: {auth.specialty} • {auth.city || "Global"}
                    </p>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed line-clamp-3">
                    "{auth.bio}"
                  </p>

                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center space-x-3.5 text-neutral-400">
                    {auth.socials.twitter && (
                      <a href={auth.socials.twitter} target="_blank" rel="noreferrer" className="hover:text-accentNeon transition-colors">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {auth.socials.github && (
                      <a href={auth.socials.github} target="_blank" rel="noreferrer" className="hover:text-accentNeon transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {auth.socials.linkedin && (
                      <a href={auth.socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-accentNeon transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. POPULAR TOPICS TAGS PANEL */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-4">
          <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] uppercase font-mono font-bold text-accentNeon block">Popular Knowledge Maps</span>
              <h4 className="font-serif text-lg md:text-xl font-bold text-darkBg dark:text-editorial">
                Overlord topics trending today
              </h4>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center md:justify-end">
              {categories.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    const targetGrid = document.getElementById("articles-anchor");
                    if (targetGrid) {
                      targetGrid.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="font-mono text-[10px] bg-neutral-100 hover:bg-accentNeon/20 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 dark:hover:text-accentNeon px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-750 hover:border-accentNeon/40 transition-colors cursor-pointer"
                >
                  #{tag.toUpperCase().replace(/\s+/g, "_")}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 7. NEWSLETTER SUBSCRIPTION SECTION */}
        <section id="newsletter-section" className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="rounded-2xl p-6 md:p-12 relative overflow-hidden bg-neutral-950 text-white mesh-glow border border-neutral-800/80">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Form panel info (lg:col-span-6) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center space-x-2 bg-neutral-900 border border-neutral-800/80 px-3 py-1 rounded-full">
                  <Mail className="w-3.5 h-3.5 text-accentNeon" />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-accentNeon font-black">
                    Synapse Intelligence
                  </span>
                </div>
                
                <h3 className="font-serif text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  Stay Ahead of the Future
                </h3>

                <p className="text-neutral-400 font-light text-sm md:text-base leading-relaxed">
                  Join thousands of software engineers, AI research leads, and founders receiving high-dimensional intellectual technology briefs every week. No spam. Direct cognitive value.
                </p>

                {/* Social Proof metrics */}
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex -space-x-2">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=40&h=40&q=80" alt="reader" className="w-8 h-8 rounded-full border border-neutral-900 object-cover" />
                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=40&h=40&q=80" alt="reader" className="w-8 h-8 rounded-full border border-neutral-900 object-cover" />
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=40&h=40&q=80" alt="reader" className="w-8 h-8 rounded-full border border-neutral-900 object-cover" />
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">
                    <strong className="text-accentNeon text-neutral-200">12K+ Visitories</strong> registered within the node
                  </span>
                </div>
              </div>

              {/* Input section (lg:col-span-6) */}
              <div className="lg:col-span-6 space-y-4">
                <form onSubmit={handleSubscribeNewsletter} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    placeholder="Enter database-bound email..."
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-black/80 border border-neutral-800 text-sm p-3 px-4 rounded-lg focus:border-accentNeon text-white outline-none placeholder:text-neutral-500"
                  />
                  <button
                    type="submit"
                    disabled={isNewsletterSubmitting}
                    className="bg-accentNeon text-darkBg font-bold text-xs p-3.5 px-6 rounded-lg hover:bg-hoverNeon transition-all cursor-pointer inline-flex items-center justify-center space-x-2 shrink-0 active:scale-95 disabled:opacity-50"
                  >
                    <span>{isNewsletterSubmitting ? "Decrypting..." : "Secure Access"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Sub status message displays */}
                <AnimatePresence>
                  {newsletterResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-accentNeon/5 border border-accentNeon/20 rounded-lg space-y-2 text-left"
                    >
                      <p className="text-xs font-bold text-accentNeon flex items-center space-x-1">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span>Intellectual synaps channels established!</span>
                      </p>
                      <p className="text-xs text-neutral-200 leading-snug">
                        {newsletterResponse.message}
                      </p>
                      {newsletterResponse.prediction && (
                        <div className="pt-2 border-t border-neutral-800 space-y-1">
                          <span className="text-[9px] font-mono uppercase text-neutral-400 block">Personalized Forecast</span>
                          <p className="text-xs italic text-neutral-300 leading-relaxed">
                            "{newsletterResponse.prediction}"
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {newsletterError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/40 rounded-lg text-xs text-red-400 flex items-start space-x-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">Submitting failure</p>
                        <p className="text-[11px] text-neutral-400">{newsletterError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </section>

        {/* 8. PODCAST SECTION DECK */}
        <PodcastSection episodes={podcastEpisodes} />

        {/* 9. COMMUNITY CHAT AND DISCUSSIONS DECK */}
        <CommunitySection discussions={discussions} />

        {/* Recently Read Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <History className="w-5 h-5 text-accentNeon" />
              <h2 className="font-serif text-xl md:text-2xl font-black tracking-tight text-darkBg dark:text-editorial">
                Recently Read Specs
              </h2>
            </div>
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800">
              Session History
            </span>
          </div>

          {recentlyRead.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-white/40 dark:bg-neutral-950/20">
              <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                NO RECENT SPECTACLES DECRYPTED YET.
              </p>
              <p className="text-[10px] text-neutral-500 mt-1">
                Your reading footprint during this session will compile here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentlyRead.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="group cursor-pointer bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
                  id={`recent-read-item-${art.id}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-darkBg text-editorial dark:bg-accentNeon/10 dark:text-accentNeon font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        {art.category}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">{art.date}</span>
                    </div>

                    <h4 className="font-serif text-base font-extrabold text-darkBg dark:text-editorial leading-snug group-hover:text-accentNeon transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                    
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed font-light">
                      {art.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 mt-4 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span className="hover:text-accentNeon transition-colors truncate max-w-[130px]">
                      By {art.author.name}
                    </span>
                    <span className="flex items-center space-x-1 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-accentNeon" />
                      <span>{art.readTime}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Awwwards Achievements Ribbon */}
        <section className="bg-editorial border-t border-gray-200 dark:bg-darkBg dark:border-neutral-900 py-12 px-4 text-center">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-around gap-6 text-neutral-400 uppercase font-mono text-[10px] tracking-widest leading-loose">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-darkBg dark:text-editorial">🏆 BEST TECH INDEPENDENT 2026</span>
              <span className="text-[8px] text-neutral-500">Design Award</span>
            </div>
            <div className="hidden md:block text-neutral-600">//</div>
            <div className="flex flex-col items-center space-y-2">
              <span className="text-darkBg dark:text-editorial">🎨 EXCELLENCE IN COGNITIVE LAYOUT</span>
              <span className="text-[8px] text-neutral-500">Awwwards nominee</span>
            </div>
            <div className="hidden md:block text-neutral-600">//</div>
            <div className="flex flex-col items-center space-y-2">
              <span className="text-darkBg dark:text-editorial">📈 TOP CRITICAL SECTOR JOURNAL</span>
              <span className="text-[8px] text-neutral-500">FWA design systems</span>
            </div>
          </div>
        </section>

        {/* 10. MULTI-COLUMN PREMIUM FOOTER WITH LARGE WORDMARK */}
        <footer className="bg-black text-white pt-20 pb-8 px-4 md:px-8 border-t border-neutral-900">
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Split row links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-12">
              
              {/* BRAND DIRECTORY COLUMN (lg:col-span-4) */}
              <div className="lg:col-span-5 space-y-4">
                <span className="font-serif text-3xl font-black text-white tracking-tight">
                  Future<span className="italic text-neutral-500 font-bold">Scope</span>
                </span>
                <p className="text-xs text-neutral-400 max-w-sm leading-relaxed font-light">
                  A high-performance digital monograph designed to inspect deep artificial neural designs, scalable compilation benchmarks, zero-trust cryptographic models, and respectful human electronics.
                </p>
                <div className="flex items-center space-x-3 text-neutral-400 pt-2">
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 bg-neutral-900 hover:bg-accentNeon hover:text-darkBg rounded-full transition-all">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 bg-neutral-900 hover:bg-accentNeon hover:text-darkBg rounded-full transition-all">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 bg-neutral-900 hover:bg-accentNeon hover:text-darkBg rounded-full transition-all">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* DIRECT LINKS - 1 (lg:col-span-2) */}
              <div className="lg:col-span-2 space-y-3.5 text-left">
                <h5 className="font-mono text-[10px] font-bold text-accentNeon uppercase tracking-widest">
                  Intelligence Sector
                </h5>
                <ul className="space-y-2 text-xs text-neutral-400 font-light">
                  <li><button onClick={() => { setActiveCategory("AI"); }} className="hover:text-accentNeon transition-colors">Cognitive Networks</button></li>
                  <li><button onClick={() => { setActiveCategory("cybersecurity"); }} className="hover:text-accentNeon transition-colors">Cryptography Vectors</button></li>
                  <li><button onClick={() => { setActiveCategory("programming"); }} className="hover:text-accentNeon transition-colors">Syntactic Compilers</button></li>
                  <li><button onClick={() => { setActiveCategory("startups"); }} className="hover:text-accentNeon transition-colors">Venture Economics</button></li>
                </ul>
              </div>

              {/* DIRECT LINKS - 2 (lg:col-span-2) */}
              <div className="lg:col-span-2 space-y-3.5 text-left">
                <h5 className="font-mono text-[10px] font-bold text-accentNeon uppercase tracking-widest">
                  Scientific resources
                </h5>
                <ul className="space-y-2 text-xs text-neutral-400 font-light">
                  <li><a href="#podcast-section" className="hover:text-accentNeon transition-colors">Audio broadcast streams</a></li>
                  <li><a href="#community-section" className="hover:text-accentNeon transition-colors">Discussion panels matrix</a></li>
                  <li><button onClick={() => { setActiveCategory("tutorials"); }} className="hover:text-accentNeon transition-colors">Logical tutorials guides</button></li>
                  <li><button onClick={() => { setActiveCategory("all"); }} className="hover:text-accentNeon transition-colors font-semibold text-neutral-300">Monograph registry</button></li>
                </ul>
              </div>

              {/* METRIC SPECS (lg:col-span-3) */}
              <div className="lg:col-span-3 space-y-4 text-left">
                <h5 className="font-mono text-[10px] font-bold text-accentNeon uppercase tracking-widest">
                  System telemetry specs
                </h5>
                <div className="space-y-2 text-[10px] font-mono text-neutral-500 leading-relaxed">
                  <p>NODE_ENV // production</p>
                  <p>SSL // active certificate</p>
                  <p>GEMINI_MODALITY // text, speech, code</p>
                  <p>LATENCY // minimal edge delivery</p>
                </div>
              </div>

            </div>

            {/* GIGANTIC MONUMENTAL SERIF DISPLAY LOGO IN METERS AT FOOTER CENTER */}
            <div className="pt-8 border-t border-neutral-900 select-none text-center">
              <span className="font-serif text-[12vw] md:text-[14vw] font-black tracking-tighter text-neutral-900 leading-none block font-display uppercase">
                FutureScope
              </span>
            </div>

            {/* Bottom Credit copyrights */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-neutral-500 gap-4">
              <span>ALL RIGHTS RESERVED © {new Date().getFullYear()} FUTURESCOPE JOURNAL INC.</span>
              <span className="flex items-center space-x-1 shadow-sm px-3 py-1 bg-neutral-900/30 rounded border border-neutral-900">
                <span className="w-1.5 h-1.5 rounded-full bg-accentNeon animate-pulse" />
                <span>DESIGNED WITH LUXURY EDITORIAL SPECIFICATION</span>
              </span>
            </div>

          </div>
        </footer>

      </div>

      {/* reader drawer Overlay modal displays */}
      <AnimatePresence>
        {selectedArticle && (
          <ArticleModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onLike={handleLikeArticle}
            hasLiked={likedArticles.includes(selectedArticle.id)}
            onSelectArticle={setSelectedArticle}
            user={user}
            onSignIn={handleSignIn}
          />
        )}

        <ProfileDrawer
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          likedCount={likedArticles.length}
          readCount={recentlyRead.length}
          newsletterSubscribed={newsletterResponse !== null}
          onSignOut={handleSignOut}
        />
      </AnimatePresence>

    </div>
  );
}
