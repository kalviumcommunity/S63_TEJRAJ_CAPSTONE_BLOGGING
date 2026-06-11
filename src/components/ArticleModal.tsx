import React, { useState, useEffect, useRef } from "react";
import { Article } from "../types";
import { articles } from "../data/blogData";
import { X, Sparkles, Heart, Clock, Share2, ThumbsUp, HelpCircle, Volume2, Play, Pause, Square, Headphones, AudioLines, BookOpen, ArrowRight, MessageSquare, Trash2, Send, Twitter, Github, Linkedin, MapPin, Award, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "firebase/auth";

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onLike: (articleId: string) => void;
  hasLiked: boolean;
  onSelectArticle?: (article: Article) => void;
  user: User | null;
  onSignIn: () => void;
}

interface ThreadComment {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
}

// Simple and highly robust in-file Markdown formatter to render Gemini output beautifully
// without standard React-Markdown compile dependencies. Handles headers, bolds, and bullet points.
function FormattedAIResponse({ text }: { text: string }) {
  const lines = text.split("\n");
  let inList = false;
  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        inList = false;
      }
      return;
    }

    // Bold text headers (Matches: **Header** or ### Header or ## Header)
    if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
      if (inList) inList = false;
      const cleanHeader = trimmed.replace(/^#+\s*/, "");
      renderedElements.push(
        <h3 key={`h-${index}`} className="font-serif text-lg font-bold text-darkBg dark:text-editorial mt-5 mb-2 first:mt-2">
          {cleanHeader}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      if (inList) inList = false;
      const boldText = trimmed.slice(2, -2);
      renderedElements.push(
        <h4 key={`b-title-${index}`} className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-300 mt-4 mb-1">
          {boldText}
        </h4>
      );
      return;
    }

    // Bullet points (Matches: - item or * item)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const bulletContent = trimmed.slice(2);
      if (!inList) {
        inList = true;
      }
      
      // Parse inline bold tags in bullets (e.g. **bold**: text)
      const boldParts = bulletContent.split("**");
      const formattedParts = boldParts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} className="font-bold text-darkBg dark:text-editorial">{part}</strong>;
        }
        return part;
      });

      renderedElements.push(
        <li key={`li-${index}`} className="ml-4 list-disc pl-1 text-sm text-neutral-700 dark:text-neutral-300 mb-1.5 leading-relaxed">
          {formattedParts}
        </li>
      );
      return;
    }

    // Default Paragraph line
    if (inList) inList = false;
    // Highlight inline bold text inside paragraph
    const boldParts = trimmed.split("**");
    const formattedParagraph = boldParts.map((part, pIdx) => {
      if (pIdx % 2 === 1) {
        return <strong key={pIdx} className="font-semibold text-darkBg dark:text-white font-mono text-xs bg-accentNeon/10 dark:bg-accentNeon/5 px-1 rounded-sm">{part}</strong>;
      }
      return part;
    });

    renderedElements.push(
      <p key={`p-${index}`} className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
        {formattedParagraph}
      </p>
    );
  });

  return (
    <div className="space-y-1 font-sans">
      {renderedElements}
    </div>
  );
}

export default function ArticleModal({ article, onClose, onLike, hasLiked, onSelectArticle, user, onSignIn }: ArticleModalProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showAuthorDetail, setShowAuthorDetail] = useState(false);

  // Scroll container reference
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Bullet point summary states
  const [bulletSummary, setBulletSummary] = useState<string | null>(null);
  const [isBulletSummaryLoading, setIsBulletSummaryLoading] = useState(false);
  const [bulletSummaryError, setBulletSummaryError] = useState<string | null>(null);

  // Premium commenting states
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [articleComments, setArticleComments] = useState<ThreadComment[]>([]);

  // Speech Synthesis state
  const [speechState, setSpeechState] = useState({
    isPlaying: false,
    isPaused: false,
  });
  const [speechRate, setSpeechRate] = useState(1);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [showSpeechPanel, setShowSpeechPanel] = useState(false);

  // Initialize Speech Synthesis and voices list
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeechSupported(true);
      const updateVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        // Filter out non-readable voices or empty names, sort optionally
        const englishOrCommon = allVoices.filter(v => v.lang.startsWith("en") || v.lang.startsWith("es") || v.lang.startsWith("fr") || v.lang.startsWith("de"));
        const listToUse = englishOrCommon.length > 0 ? englishOrCommon : allVoices;
        setVoices(listToUse);

        if (listToUse.length > 0) {
          const defaultVoice = 
            listToUse.find(v => v.name.toLowerCase().includes("natural")) || 
            listToUse.find(v => v.lang.startsWith("en-") && v.name.includes("Google")) || 
            listToUse.find(v => v.lang.startsWith("en-")) || 
            listToUse[0];
          setSelectedVoiceName(defaultVoice ? defaultVoice.name : "");
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Reset AI panel when article switches
    setAiSummary(null);
    setAiError(null);
    setIsAiLoading(false);
    setReadingProgress(0);

    // Reset bullet summary
    setBulletSummary(null);
    setBulletSummaryError(null);
    setIsBulletSummaryLoading(false);

    // Reset speech when article changes
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeechState({ isPlaying: false, isPaused: false });
    setShowShareMenu(false);
    setShowAuthorDetail(false);

    // Scroll to top of preview when article switches
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }

    // Load or Seed comments when article switches
    if (article) {
      const stored = localStorage.getItem(`futurescope_comments_${article.id}`);
      if (stored) {
        try {
          setArticleComments(JSON.parse(stored));
        } catch (e) {
          setArticleComments([]);
        }
      } else {
        const seedComments: ThreadComment[] = [
          {
            id: `seed-1-${article.id}`,
            authorName: "FutureScope Editorial Bot",
            content: `What is your projection on this breakthrough? Join the discussion, share your predictions or notes on "${article.title}" below!`,
            timestamp: "Editorial Dispatch"
          }
        ];
        setArticleComments(seedComments);
      }
    }
    setCommentText("");
  }, [article]);

  // Handle scroll progress within the modal body
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const totalHeight = target.scrollHeight - target.clientHeight;
    if (totalHeight > 0) {
      setReadingProgress((target.scrollTop / totalHeight) * 100);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const nameToUse = user ? (user.displayName || user.email || "Google User") : (commentName.trim() || "Anonymous Reader");
    const newComment: ThreadComment = {
      id: `comment-${Date.now()}`,
      authorName: nameToUse,
      content: commentText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " • " + new Date().toLocaleDateString(),
    };

    const updated = [newComment, ...articleComments];
    setArticleComments(updated);
    if (article) {
      localStorage.setItem(`futurescope_comments_${article.id}`, JSON.stringify(updated));
    }

    setCommentText("");
  };

  const handleDeleteComment = (commentId: string) => {
    const updated = articleComments.filter(c => c.id !== commentId);
    setArticleComments(updated);
    if (article) {
      localStorage.setItem(`futurescope_comments_${article.id}`, JSON.stringify(updated));
    }
  };

  if (!article) return null;

  const triggerGenerativeSummary = async () => {
    setIsAiLoading(true);
    setAiError(null);
    setAiSummary(null);

    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          description: article.description,
          content: article.body
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Summarization endpoint failed with status error.");
      }

      setAiSummary(data.summary);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Unable to dispatch request to FutureScope synthesis pipelines.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const triggerBulletSummary = async () => {
    setIsBulletSummaryLoading(true);
    setBulletSummaryError(null);
    setBulletSummary(null);

    try {
      const response = await fetch("/api/ai/quick-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          description: article.description,
          content: article.body
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Bullet summary endpoint failed.");
      }

      setBulletSummary(data.summary);
    } catch (err: any) {
      console.error(err);
      setBulletSummaryError(err.message || "Failed to compile AI summary. Please check connection.");
    } finally {
      setIsBulletSummaryLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/#${article.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Start, pause or stop speech synthesis
  const handlePlaySpeech = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speechState.isPaused) {
      window.speechSynthesis.resume();
      setSpeechState({ isPlaying: true, isPaused: false });
      return;
    }

    // Cancel any current utterance
    window.speechSynthesis.cancel();

    // Use full text to speak: Title, abstract, and content paragraphs
    const textToSpeak = `${article.title}. ${article.description}. ${article.body.join(" ")}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (selectedVoiceName) {
      const selectedVoice = voices.find(v => v.name === selectedVoiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.rate = speechRate;
    
    utterance.onend = () => {
      setSpeechState({ isPlaying: false, isPaused: false });
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error or interruption:", e);
      // Fallback update
      setSpeechState({ isPlaying: false, isPaused: false });
    };

    window.speechSynthesis.speak(utterance);
    setSpeechState({ isPlaying: true, isPaused: false });
  };

  const handlePauseSpeech = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setSpeechState({ isPlaying: false, isPaused: true });
  };

  const handleStopSpeech = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeechState({ isPlaying: false, isPaused: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-darkBg/60 backdrop-blur-sm p-0 md:p-4">
      {/* Background click close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Body container */}
      <motion.div
        initial={{ x: "100%", opacity: 0.9 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 180 }}
        className="relative flex flex-col w-full max-w-4xl h-full bg-editorial dark:bg-[#111111] shadow-2xl overflow-hidden border-l border-neutral-200 dark:border-neutral-800 rounded-none md:rounded-l-2xl"
      >
        {/* Reading progress bar at the very top of the viewport */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 z-[100]">
          <div
            className="h-full bg-accentNeon shadow-[0_0_8px_rgba(184,255,79,0.8)] transition-all duration-75"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Modal Sticky Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-900 bg-editorial/90 dark:bg-darkBg/90 z-20">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accentNeon animate-pulse" />
              <span>FutureScope Reader Mode</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {speechSupported && (
              <button
                onClick={() => setShowSpeechPanel(!showSpeechPanel)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  speechState.isPlaying
                    ? "bg-accentNeon/20 border-accentNeon text-darkBg dark:text-accentNeon shadow-md animate-pulse"
                    : showSpeechPanel
                    ? "bg-neutral-200 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-600 text-darkBg dark:text-editorial"
                    : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-darkBg dark:hover:border-editorial text-neutral-700 dark:text-neutral-300"
                }`}
                title="Listen to this article aloud"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{speechState.isPlaying ? "Listening..." : "Listen"}</span>
              </button>
            )}

            <button
              onClick={() => onLike(article.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                hasLiked
                  ? "bg-red-500/10 border-red-500 text-red-500 scale-95"
                  : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-darkBg dark:hover:border-editorial text-neutral-700 dark:text-neutral-300"
              }`}
              title="Like this article"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? "fill-red-500" : ""}`} />
              <span>{article.likes + (hasLiked ? 1 : 0)}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  showShareMenu
                    ? "bg-accentNeon border-accentNeon text-darkBg shadow-md"
                    : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-darkBg dark:hover:border-editorial text-neutral-700 dark:text-neutral-300"
                }`}
                title="Share this article"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <>
                    {/* Click-shield background to close on click away */}
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setShowShareMenu(false)} 
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl py-1.5 z-40 select-none overflow-hidden"
                    >
                      <div className="px-3.5 py-1 border-b border-neutral-100 dark:border-neutral-800">
                        <span className="font-mono text-[8px] uppercase tracking-wider text-neutral-400">
                          SHARE SYNAPSE
                        </span>
                      </div>
                      
                      {/* Twitter */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${article.title}" on FutureScope!`)}&url=${encodeURIComponent(`${window.location.origin}/#${article.id}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowShareMenu(false)}
                        className="flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span>Twitter / X</span>
                      </a>

                      {/* LinkedIn */}
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/#${article.id}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowShareMenu(false)}
                        className="flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
                        </svg>
                        <span>LinkedIn</span>
                      </a>

                      {/* Reddit */}
                      <a
                        href={`https://www.reddit.com/submit?title=${encodeURIComponent(`Check out "${article.title}" on FutureScope!`)}&url=${encodeURIComponent(`${window.location.origin}/#${article.id}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowShareMenu(false)}
                        className="flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.23-1.72l1.31-4.14 4.26 1c.02.93.81 1.67 1.77 1.67 1.02 0 1.85-.83 1.85-1.85s-.83-1.85-1.85-1.85c-.82 0-1.5.53-1.73 1.27l-4.78-1.12c-.22-.05-.44.08-.51.3l-1.52 4.81c-2.44.05-4.69.7-6.35 1.71-.56-.73-1.44-1.19-2.43-1.19-1.65 0-3 1.35-3 3 0 1.12.61 2.1 1.54 2.62-.05.29-.08.59-.08.88 0 3.86 4.49 7 10 7s10-3.14 10-7c0-.29-.03-.59-.08-.88.93-.52 1.54-1.5 1.54-2.62zm-18 1c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm11 4.5c-1.65 1.65-4.8 1.65-6.45 0-.15-.15-.15-.41 0-.56.15-.15.41-.15.56 0 1.37 1.37 4.01 1.37 5.38 0 .15-.15.41-.15.56 0 .14.15.14.41-.05.56zm-1.5-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                        </svg>
                        <span>Reddit</span>
                      </a>

                      {/* Copy Link Option */}
                      <button
                        onClick={() => {
                          handleCopyLink();
                          setShowShareMenu(false);
                        }}
                        className="w-full text-left flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-accentNeon transition-colors border-t border-neutral-100 dark:border-neutral-800/80 mt-1 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{copiedLink ? "Copied Link!" : "Copy Link"}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-darkBg dark:hover:text-editorial rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
              aria-label="Close reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Voice companion action panel */}
        <AnimatePresence>
          {showSpeechPanel && speechSupported && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-3 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 z-10 select-none overflow-hidden"
            >
              <div className="flex items-center space-x-3">
                <div className="relative flex items-center justify-center">
                  <AudioLines className={`w-4 h-4 text-accentNeon ${speechState.isPlaying ? "animate-pulse" : ""}`} />
                  {speechState.isPlaying && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentNeon opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accentNeon"></span>
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-darkBg dark:text-editorial">
                    Audio Narrator
                  </div>
                  <div className="text-[9px] text-neutral-400">
                    High-quality on-device Web Speech engine
                  </div>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center space-x-2">
                {!speechState.isPlaying && !speechState.isPaused ? (
                  <button
                    onClick={handlePlaySpeech}
                    className="flex items-center space-x-1 bg-accentNeon hover:bg-hoverNeon text-darkBg text-[10px] font-bold px-3 py-1.5 rounded-md cursor-pointer transition-all"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>START</span>
                  </button>
                ) : (
                  <>
                    {speechState.isPlaying ? (
                      <button
                        onClick={handlePauseSpeech}
                        className="flex items-center space-x-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-500 text-[10px] font-bold px-3 py-1.5 rounded-md cursor-pointer transition-all"
                      >
                        <Pause className="w-3 h-3 fill-current" />
                        <span>PAUSE</span>
                      </button>
                    ) : (
                      <button
                        onClick={handlePlaySpeech}
                        className="flex items-center space-x-1 bg-accentNeon hover:bg-hoverNeon text-darkBg text-[10px] font-bold px-3 py-1.5 rounded-md cursor-pointer transition-all animate-pulse"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>RESUME</span>
                      </button>
                    )}

                    <button
                      onClick={handleStopSpeech}
                      className="flex items-center space-x-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-[10px] font-bold px-3 py-1.5 rounded-md cursor-pointer transition-all"
                    >
                      <Square className="w-2.5 h-2.5 fill-current" />
                      <span>STOP</span>
                    </button>
                  </>
                )}
              </div>

              {/* Settings / Controls inside the companion panel */}
              <div className="flex items-center space-x-4">
                {/* Speech rate selection */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-mono text-neutral-400">SPEED:</span>
                  <select
                    value={speechRate}
                    onChange={(e) => {
                      const newRate = parseFloat(e.target.value);
                      setSpeechRate(newRate);
                      // If speaking, restart with new rate for instant feedback
                      if (speechState.isPlaying || speechState.isPaused) {
                        setTimeout(() => handlePlaySpeech(), 100);
                      }
                    }}
                    className="text-[10px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-0.5 outline-none font-mono text-darkBg dark:text-editorial cursor-pointer"
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2.0x</option>
                  </select>
                </div>

                {/* Voice Selection */}
                {voices.length > 0 && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] font-mono text-neutral-400">VOICE:</span>
                    <select
                      value={selectedVoiceName}
                      onChange={(e) => {
                        setSelectedVoiceName(e.target.value);
                        // If speaking, restart with new voice for instant feedback
                        if (speechState.isPlaying || speechState.isPaused) {
                          setTimeout(() => handlePlaySpeech(), 100);
                        }
                      }}
                      className="text-[10px] max-w-[140px] truncate bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-0.5 outline-none font-mono text-darkBg dark:text-editorial cursor-pointer"
                    >
                      {voices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Body Scrollable section */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-6 md:p-12 space-y-8"
        >
          {/* Cover Header and Categories Badges */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="bg-accentNeon/30 text-darkBg font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                {article.category}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readTime} study</span>
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-black tracking-tight text-darkBg dark:text-editorial leading-tight">
              {article.title}
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 font-serif font-light italic leading-relaxed">
              "{article.description}"
            </p>

            {/* Author Credit */}
            <div 
              onClick={() => setShowAuthorDetail(true)}
              className="flex items-center space-x-4 py-4 border-y border-gray-200 dark:border-neutral-900 cursor-pointer group/author hover:border-accentNeon dark:hover:border-accentNeon/50 transition-all"
              title="Click to view full bio & portfolio"
            >
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-12 h-12 rounded-full border-2 border-accentNeon object-cover group-hover/author:scale-105 transition-all duration-300"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-darkBg dark:text-editorial group-hover/author:text-accentNeon transition-colors flex items-center space-x-2">
                  <span>{article.author.name}</span>
                  <span className="text-[8px] font-mono font-normal uppercase text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded opacity-0 group-hover/author:opacity-100 transition-opacity duration-300">
                    VIEW BIO // ARTICLES
                  </span>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono uppercase">
                  {article.author.role} • {article.date}
                </div>
              </div>
            </div>
          </div>

          {/* Immersive Cover Image */}
          <div className="w-full relative aspect-[16/9] md:aspect-[21/9] bg-neutral-200 dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <img
              src={article.cover}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-darkBg/30 via-transparent to-transparent" />
          </div>

          {/* DYNAMIC TWO-COLUMN EDITORIAL PANELS (Content Left, AI Summarizer Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            {/* ARTICLE PARAGRAPHS - COLUMN */}
            <article className="lg:col-span-7 space-y-6">
              {/* AI Bullet Point Summary Section */}
              <div className="mb-6 space-y-4">
                {!user ? (
                  <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl p-5 bg-neutral-100/40 dark:bg-neutral-900/10 text-center space-y-3.5 relative overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-accentNeon/10 text-accentNeon flex items-center justify-center mx-auto border border-accentNeon/20">
                      <Lock className="w-5 h-5 text-accentNeon" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-darkBg dark:text-editorial">
                        AI Telemetry Locked
                      </h4>
                      <p className="text-[11px] text-neutral-500 max-w-xs mx-auto leading-relaxed pt-1">
                        Establish Google connection node to decrypt premium generative summaries.
                      </p>
                    </div>
                    <button
                      onClick={onSignIn}
                      className="bg-accentNeon text-darkBg font-mono text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-hoverNeon transition-all cursor-pointer shadow-md inline-flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-darkBg" />
                      <span>Authenticate Node</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {!bulletSummary && !isBulletSummaryLoading && (
                      <button
                        onClick={triggerBulletSummary}
                        className="flex items-center space-x-2 bg-gradient-to-r from-accentNeon to-hoverNeon text-darkBg border border-darkBg/10 px-4 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider shadow-sm hover:shadow hover:scale-[1.02] active:scale-95 transition-all text-left group"
                        id="btn-ai-quick-summary"
                      >
                        <Sparkles className="w-4 h-4 animate-pulse text-darkBg" />
                        <span>Get AI Summary (3 Bullets)</span>
                      </button>
                    )}

                    {isBulletSummaryLoading && (
                      <div className="border border-neutral-300 dark:border-neutral-800 rounded-xl p-5 bg-white/25 dark:bg-neutral-900/25 backdrop-blur-xs flex items-center space-x-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-accentNeon/30 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-accentNeon" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 bg-neutral-300 dark:bg-neutral-800 rounded w-1/3" />
                          <div className="h-2.5 bg-neutral-200 dark:bg-neutral-900 rounded w-2/3" />
                        </div>
                      </div>
                    )}

                    {bulletSummaryError && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 space-y-1">
                        <p className="text-xs font-bold font-mono">AI SUMMARY ERROR</p>
                        <p className="text-xs">{bulletSummaryError}</p>
                        <button
                          onClick={triggerBulletSummary}
                          className="text-[10px] font-mono underline hover:text-red-400 mt-1"
                        >
                          Retry Generation
                        </button>
                      </div>
                    )}
                  </>
                )}

                {bulletSummary && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-accentNeon/40 dark:border-accentNeon/30 rounded-xl p-5 bg-accentNeon/[0.02] dark:bg-accentNeon/[0.01] relative overflow-hidden backdrop-blur-xs space-y-3 shadow-lg shadow-accentNeon/[0.02]"
                  >
                    {/* Background glow strip */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accentNeon via-hoverNeon to-accentNeon" />
                    
                    <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-accentNeon" />
                        <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-darkBg dark:text-editorial">
                          EXECUTIVE DEBRIEF // FutureScope AI
                        </span>
                      </div>
                      <button
                        onClick={() => setBulletSummary(null)}
                        className="text-[10px] tracking-wider text-neutral-400 hover:text-darkBg dark:text-neutral-500 dark:hover:text-editorial font-mono uppercase bg-neutral-200/50 dark:bg-neutral-800/40 px-2 py-0.5 rounded-md hover:scale-95 transition-all"
                      >
                        Clear
                      </button>
                    </div>

                    <ul className="space-y-2.5 text-sm text-neutral-800 dark:text-neutral-250 selection:bg-accentNeon/30">
                      {bulletSummary
                        .split("\n")
                        .filter(line => line.trim())
                        .map((bullet, idx) => {
                          const cleanBullet = bullet.replace(/^[-*•]\s*/, "").replace(/^3\.\s*|^2\.\s*|^1\.\s*/, "").trim();
                          if (!cleanBullet) return null;
                          return (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-start space-x-2.5"
                            >
                              <span className="text-accentNeon font-black text-sm select-none leading-none mt-0.5">▪</span>
                              <span className="leading-relaxed font-light">{cleanBullet}</span>
                            </motion.li>
                          );
                        })}
                    </ul>
                  </motion.div>
                )}
              </div>

              {article.body.map((para, pIdx) => (
                <p
                  key={pIdx}
                  className="font-sans text-base md:text-lg text-neutral-800 dark:text-neutral-300 leading-relaxed font-light first-letter:text-3xl first-letter:font-serif first-letter:mr-1 first-letter:font-black"
                >
                  {para}
                </p>
              ))}

              {/* INTERACTIVE COMMENTS SECTION */}
              <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 mt-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-accentNeon" />
                    <h3 className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-darkBg dark:text-editorial">
                      READER SYNAPSE // Community Notes ({articleComments.length})
                    </h3>
                  </div>
                  <span className="font-mono text-[8px] text-neutral-400 uppercase tracking-widest">
                    SESSION PERSISTENT
                  </span>
                </div>

                {/* Comment Insertion Form */}
                {!user ? (
                  <div className="bg-neutral-100/40 dark:bg-neutral-900/10 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl p-5 text-center space-y-3">
                    <p className="text-xs font-semibold text-neutral-850 dark:text-neutral-400">
                      Cognitive connection offline. You must log in to submit observations to this terminal thread.
                    </p>
                    <button
                      type="button"
                      onClick={onSignIn}
                      className="bg-accentNeon text-darkBg font-mono text-[9px] font-black uppercase tracking-wider px-5 py-2.5 rounded-lg hover:bg-hoverNeon transition-all cursor-pointer shadow-md inline-flex items-center space-x-1.5 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-darkBg" />
                      <span>Authenticate Google Node to Comment</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddComment} className="space-y-3 bg-neutral-50/50 dark:bg-neutral-900/10 p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-1">
                        {user ? (
                          <div>
                            <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-1">SIGNED IN AS</label>
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-lg overflow-hidden">
                              {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || "User"} className="w-5.5 h-5.5 rounded-full object-cover border border-accentNeon" />
                              ) : (
                                <div className="w-5.5 h-5.5 rounded-full bg-accentNeon text-darkBg flex items-center justify-center text-[10px] font-bold font-mono">
                                  {user.displayName?.charAt(0) || "U"}
                                </div>
                              )}
                              <div className="truncate leading-tight">
                                <span className="block text-[10px] font-bold text-darkBg dark:text-editorial truncate">{user.displayName || "Google User"}</span>
                                <span className="block text-[7px] font-mono text-neutral-450 truncate">{user.email}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-1">ALIAS // OPTIONAL</label>
                            <input
                              type="text"
                              value={commentName}
                              onChange={(e) => setCommentName(e.target.value)}
                              placeholder="e.g. CyberNaut, Anon"
                              maxLength={25}
                              className="w-full text-xs px-3 py-2 bg-white dark:bg-neutral-905 text-neutral-800 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700/80 rounded-lg focus:outline-none focus:border-accentNeon dark:focus:border-accentNeon transition-all outline-none"
                            />
                          </>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-1">COMMENTS // OBSERVATIONS</label>
                        <div className="relative flex items-center">
                          <textarea
                            rows={1}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Synthesize your observation or critique..."
                            required
                            className="w-full text-xs px-3 py-2 pr-10 bg-white dark:bg-neutral-905 text-neutral-800 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700/80 rounded-lg focus:outline-none focus:border-accentNeon dark:focus:border-accentNeon scrollbar-none outline-none resize-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(e);
                              }
                            }}
                          />
                          <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className="absolute right-2 top-1.5 p-1.5 text-neutral-400 hover:text-accentNeon disabled:text-neutral-300 dark:disabled:text-neutral-850 cursor-pointer transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* Comments List Feed */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800">
                  <AnimatePresence initial={false}>
                    {articleComments.length === 0 ? (
                      <div className="text-center py-6 text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                        <p className="text-xs font-mono">NO SYNAPSES DISPATCHED YET.</p>
                        <p className="text-[10px] mt-1">Be the first to leave an observation!</p>
                      </div>
                    ) : (
                      articleComments.map((comment) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="group bg-white dark:bg-neutral-800/20 p-3.5 border border-neutral-200 dark:border-neutral-800/80 rounded-xl relative hover:border-neutral-300 dark:hover:border-neutral-700 transition-all space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-[10px] font-bold text-darkBg dark:text-editorial">
                                {comment.authorName}
                              </span>
                              {comment.authorName.includes("Bot") ? (
                                <span className="bg-accentNeon/20 text-darkBg dark:text-accentNeon font-mono text-[8px] font-bold px-1 rounded select-none">
                                  STAFF
                                </span>
                              ) : (
                                <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-mono text-[8px] px-1 rounded select-none">
                                  VISITOR
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[9px] font-mono text-neutral-400 select-none">
                                {comment.timestamp}
                              </span>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-neutral-400 hover:text-red-500 opacity-60 group-hover:opacity-100 transition-all p-0.5 rounded cursor-pointer"
                                title="Delete Observation"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-700 dark:text-neutral-300 font-light leading-relaxed pl-1 whitespace-pre-wrap select-text">
                            {comment.content}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </article>

            {/* INTEGRATED EXECUTIVE AI SUMMARIZER PANEL - STICKY COLUMN */}
            <aside className="lg:col-span-5 space-y-6">
              <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4 shadow-sm relative overflow-hidden mesh-glow">
                <div className="absolute top-0 right-0 bg-accentNeon text-darkBg px-3 py-1 font-mono text-[9px] font-bold rounded-bl-lg uppercase tracking-widest flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span>AI Powered</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-darkBg dark:text-editorial">
                    Executive Briefing
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Generate an instant conceptual synapse & main takeaway vectors. Sent securely and compiled server-side.
                  </p>
                </div>

                {/* AI Outputs & States */}
                {!user ? (
                  <div className="py-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-accentNeon/10 text-accentNeon flex items-center justify-center mx-auto border border-accentNeon/20">
                      <Lock className="w-5 h-5 text-accentNeon" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif text-sm font-bold text-darkBg dark:text-editorial">
                        Executive Summary Locked
                      </h4>
                      <p className="text-[11px] text-neutral-500 max-w-xs mx-auto leading-relaxed pt-1">
                        Please establish Google connection node to decrypt premium generative summaries.
                      </p>
                    </div>
                    <button
                      onClick={onSignIn}
                      className="w-full flex items-center justify-center space-x-2 bg-darkBg text-editorial dark:bg-accentNeon dark:text-darkBg py-2.5 px-4 rounded-lg font-bold text-xs shadow-md transition-all active:scale-95 hover:bg-neutral-800 dark:hover:bg-hoverNeon cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-accentNeon dark:text-darkBg" />
                      <span>Authenticate Google Node</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {!aiSummary && !isAiLoading && (
                      <button
                        onClick={triggerGenerativeSummary}
                        className="w-full flex items-center justify-center space-x-2 bg-darkBg text-editorial dark:bg-accentNeon dark:text-darkBg py-2.5 px-4 rounded-lg font-bold text-xs shadow-md transition-all active:scale-95 hover:bg-neutral-800 dark:hover:bg-hoverNeon"
                      >
                        <Sparkles className="w-4 h-4 text-accentNeon dark:text-darkBg" />
                        <span>Generate AI Briefing</span>
                      </button>
                    )}

                    {isAiLoading && (
                      <div className="py-8 text-center space-y-3">
                        <div className="relative w-12 h-12 mx-auto">
                          <div className="absolute inset-0 rounded-full border-4 border-accentNeon/20 animate-ping" />
                          <div className="absolute inset-0 rounded-full border-4 border-t-accentNeon animate-spin" />
                        </div>
                        <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest animate-pulse">
                          Synthesizing neurons...
                        </div>
                        <div className="text-[10px] text-neutral-400 italic">
                          Formulating premium trends outline via Gemini-3.5-Flash
                        </div>
                      </div>
                    )}

                    {aiError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/35 text-red-500 rounded-lg space-y-2">
                        <p className="text-xs font-semibold">Pipelines Offline</p>
                        <p className="text-[11px] leading-relaxed select-text">
                          {aiError}
                        </p>
                        <p className="text-[10px] font-mono text-neutral-500 flex items-center space-x-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Troubleshoot: Verify your GEMINI_API_KEY in Settings &gt; Secrets.</span>
                        </p>
                        <button
                          onClick={triggerGenerativeSummary}
                          className="w-full mt-2 text-center text-xs font-semibold py-1 border border-red-500/35 rounded hover:bg-red-500/10"
                        >
                          Retry Connection
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Styled AI Summary Output */}
                <AnimatePresence>
                  {aiSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-editorial/50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800/80 prose dark:prose-invert max-w-none text-left"
                    >
                      <FormattedAIResponse text={aiSummary} />
                      <button
                        onClick={triggerGenerativeSummary}
                        className="mt-4 flex items-center space-x-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-darkBg dark:hover:text-accentNeon"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Re-evaluate analysis</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Related author facts */}
              <div className="p-6 bg-editorial dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Author Spotlight
                </span>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  {article.author.name} is specialized in <strong className="text-darkBg dark:text-editorial">{article.author.specialty}</strong>, practicing out of {article.author.city}.
                </p>
                <div className="text-xs text-neutral-500 italic">
                  "{article.author.bio}"
                </div>
              </div>
            </aside>
          </div>

          {/* RECOMMENDED FOR YOU SECTION */}
          <div className="pt-8 border-t border-gray-200 dark:border-neutral-900 mt-12 space-y-6">
            <div className="flex items-center space-x-2 pb-2">
              <BookOpen className="w-4.5 h-4.5 text-accentNeon animate-pulse" />
              <h3 className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-darkBg dark:text-editorial">
                RECOMMENDED FOR YOU // Categories
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(() => {
                const sameCategory = articles.filter(
                  (art) => art.category.toLowerCase() === article.category.toLowerCase() && art.id !== article.id
                );
                let recommended = [...sameCategory];
                if (recommended.length < 3) {
                  const others = articles.filter(
                    (art) => art.id !== article.id && !recommended.some((r) => r.id === art.id)
                  );
                  recommended = [...recommended, ...others].slice(0, 3);
                } else {
                  recommended = recommended.slice(0, 3);
                }

                return recommended.map((recArt) => {
                  return (
                    <div
                      key={recArt.id}
                      onClick={() => onSelectArticle && onSelectArticle(recArt)}
                      className="group cursor-pointer bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col h-full justify-between"
                      id={`rec-item-${recArt.id}`}
                    >
                      <div className="space-y-3">
                        {/* Compact thumbnail cover */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                          <img
                            src={recArt.cover}
                            alt={recArt.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-neutral-950/10" />
                          <span className="absolute top-2.5 left-2.5 bg-darkBg text-editorial dark:bg-accentNeon dark:text-darkBg font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            {recArt.category}
                          </span>
                        </div>

                        {/* Text summary info */}
                        <div className="px-4 space-y-2">
                          <h4 className="font-serif text-[15px] font-extrabold text-darkBg dark:text-editorial leading-snug group-hover:text-accentNeon transition-colors line-clamp-2">
                            {recArt.title}
                          </h4>
                          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-light">
                            {recArt.description}
                          </p>
                        </div>
                      </div>

                      {/* Item footer summary */}
                      <div className="p-4 pt-3 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80 mt-4 bg-neutral-50/50 dark:bg-neutral-900/10">
                        <span className="font-mono text-[9px] text-neutral-400 capitalize whitespace-nowrap overflow-hidden text-ellipsis max-w-[125px]">
                          By {recArt.author.name}
                        </span>
                        
                        <span className="font-mono text-[9px] text-neutral-400 flex items-center space-x-1 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-accentNeon" />
                          <span>{recArt.readTime}</span>
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* SUB-VIEW: AUTHOR DETAIL MODAL DIALOG POPUP */}
      <AnimatePresence>
        {showAuthorDetail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Dark blur-glass overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthorDetail(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Author Detail dialog container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[85vh]"
            >
              {/* Premium colored gradient strip */}
              <div className="h-1.5 bg-gradient-to-r from-accentNeon to-hoverNeon w-full" />

              {/* Close Button */}
              <button
                onClick={() => setShowAuthorDetail(false)}
                className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-darkBg dark:hover:text-editorial rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:scale-105 transition-all cursor-pointer z-10"
                aria-label="Close author details"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Scrollable specs layout */}
              <div className="overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800">
                
                {/* Profile Header Block */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 md:gap-5">
                  <div className="relative">
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-accentNeon object-cover shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-darkBg text-accentNeon border border-accentNeon/40 text-[7px] font-mono font-black uppercase px-1.5 py-0.5 rounded shadow-xs select-none">
                      STAFF
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div>
                      <span className="font-mono text-[8px] uppercase tracking-wider text-accentNeon font-black">
                        Author Profile Spec
                      </span>
                      <h2 className="font-serif text-xl md:text-2xl font-black text-darkBg dark:text-editorial tracking-tight mt-0.5">
                        {article.author.name}
                      </h2>
                      <p className="text-xs font-mono uppercase text-neutral-500 dark:text-neutral-400 font-bold mt-0.5">
                        {article.author.role}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1 justify-center sm:justify-start text-[9px] font-mono text-neutral-500">
                      {article.author.city && (
                        <span className="bg-neutral-50 dark:bg-neutral-900 px-2 py-0.5 rounded border border-neutral-150 dark:border-neutral-800/80 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-accentNeon" />
                          <span>{article.author.city.toUpperCase()} BUREAU</span>
                        </span>
                      )}
                      {article.author.specialty && (
                        <span className="bg-neutral-50 dark:bg-neutral-900 px-2 py-0.5 rounded border border-neutral-150 dark:border-neutral-800/80 flex items-center gap-1">
                          <Award className="w-2.5 h-2.5 text-accentNeon" />
                          <span>{article.author.specialty}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Biography Section */}
                <div className="space-y-2">
                  <h3 className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800/80 pb-1 flex items-center justify-between font-bold">
                    <span>BIOGRAPHY</span>
                    <span className="text-[7px] text-neutral-500">INTEL ARCHIVE</span>
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-350 font-sans font-light leading-relaxed select-text">
                    {article.author.bio}
                  </p>
                </div>

                {/* Publications Metadata metrics */}
                <div className="grid grid-cols-2 gap-4 bg-neutral-50/70 dark:bg-neutral-900/40 p-4 border border-neutral-150 dark:border-neutral-800 rounded-xl text-center">
                  <div>
                    <span className="block text-[8px] font-mono uppercase text-neutral-400 font-medium">TOTAL PUBLICATIONS</span>
                    <span className="block font-serif text-xl font-black text-darkBg dark:text-editorial mt-0.5">
                      {articles.filter(a => a.author.id === article.author.id || a.author.name === article.author.name).length}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-mono uppercase text-neutral-400 font-medium font-bold">SYNERGY LIKES</span>
                    <span className="block font-serif text-xl font-black text-accentNeon mt-0.5">
                      {articles
                        .filter(a => a.author.id === article.author.id || a.author.name === article.author.name)
                        .reduce((acc, curr) => acc + curr.likes, 0)}
                    </span>
                  </div>
                </div>

                {/* External Social Links */}
                <div className="space-y-2.5">
                  <h3 className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800/80 pb-1 font-bold">
                    CONNECTED NETWORKS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.author.socials?.twitter && (
                      <a
                        href={article.author.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 bg-neutral-50 hover:bg-accentNeon dark:bg-neutral-900 hover:text-darkBg px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-750 dark:text-neutral-300 transition-all cursor-pointer"
                      >
                        <Twitter className="w-3.5 h-3.5" />
                        <span>TWITTER</span>
                      </a>
                    )}
                    {article.author.socials?.github && (
                      <a
                        href={article.author.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 bg-neutral-50 hover:bg-accentNeon dark:bg-neutral-900 hover:text-darkBg px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-750 dark:text-neutral-300 transition-all cursor-pointer"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>GITHUB</span>
                      </a>
                    )}
                    {article.author.socials?.linkedin && (
                      <a
                        href={article.author.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 bg-neutral-50 hover:bg-accentNeon dark:bg-neutral-900 hover:text-darkBg px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-750 dark:text-neutral-300 transition-all cursor-pointer"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>LINKEDIN</span>
                      </a>
                    )}
                    {!article.author.socials?.twitter && !article.author.socials?.github && !article.author.socials?.linkedin && (
                      <span className="text-[10px] text-neutral-400 italic">No external social specs connected yet.</span>
                    )}
                  </div>
                </div>

                {/* Articles activity list */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800/80 pb-1 flex items-center justify-between font-bold">
                    <span>PORTFOLIO ARTICLES</span>
                    <span className="text-[7px] text-neutral-500">RECENT DISPATCHES</span>
                  </h3>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 flex flex-col scrollbar-thin">
                    {articles
                      .filter(a => a.author.id === article.author.id || a.author.name === article.author.name)
                      .map((art) => (
                        <button
                          key={art.id}
                          onClick={() => {
                            if (art.id !== article.id) {
                              onSelectArticle?.(art);
                              setShowAuthorDetail(false);
                            }
                          }}
                          disabled={art.id === article.id}
                          className={`w-full text-left p-3 border rounded-xl flex flex-col justify-between transition-all group/item ${
                            art.id === article.id
                              ? "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800/80 cursor-default opacity-60"
                              : "bg-white dark:bg-neutral-950/20 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 hover:scale-[1.01] cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 uppercase tracking-wider font-mono text-[7px] px-1.5 py-0.5 rounded font-bold">
                              {art.category}
                            </span>
                            <span className="text-[8px] font-mono text-neutral-405 uppercase tracking-widest">
                              {art.date}
                            </span>
                          </div>
                          
                          <h4 className={`font-serif text-xs font-bold mt-1 text-darkBg dark:text-editorial leading-tight group-hover/item:text-accentNeon transition-colors ${art.id === article.id ? "text-neutral-500 dark:text-neutral-400" : ""}`}>
                            {art.title}
                          </h4>

                          <div className="flex items-center justify-between text-[8px] font-mono text-neutral-400 mt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-accentNeon" />
                              <span>{art.readTime} reading study</span>
                            </span>
                            {art.id === article.id && (
                              <span className="text-accentNeon font-black uppercase">Currently Reading</span>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
