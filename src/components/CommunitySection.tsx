import React, { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, Send, Sparkles, AlertCircle, HelpCircle, User, MessageCircle } from "lucide-react";
import { Discussion, Comment } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CommunitySectionProps {
  discussions: Discussion[];
}

export default function CommunitySection({ discussions: initialDiscussions }: CommunitySectionProps) {
  // Discussions vote state simulation
  const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
  const [votedDiscList, setVotedDiscList] = useState<string[]>([]);

  // Reader comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // TechSense AI Explainer state
  const [techTopic, setTechTopic] = useState("");
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Fetch comments on mount
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/comments?articleId=general");
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments || []);
      } else {
        throw new Error(data.error || "Unable to acquire comments stream.");
      }
    } catch (err: any) {
      console.warn("Backend comments sync error on UI mount:", err);
      setCommentsError("Could not connect to live server. Displaying offline memory buffers.");
    }
  };

  const handleUpvoteDiscussion = (id: string) => {
    if (votedDiscList.includes(id)) {
      // Undo upvote
      setDiscussions(prev => prev.map(d => d.id === id ? { ...d, votes: d.votes - 1 } : d));
      setVotedDiscList(prev => prev.filter(v => v !== id));
    } else {
      // Apply upvote
      setDiscussions(prev => prev.map(d => d.id === id ? { ...d, votes: d.votes + 1 } : d));
      setVotedDiscList(prev => [...prev, id]);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentBody.trim()) return;

    setIsSubmittingComment(true);
    setCommentsError(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: "general",
          author: authorName,
          body: commentBody
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Server rejected comment serialization.");
      }

      // Add to list and clear keys
      setComments(prev => [data.comment, ...prev]);
      setCommentBody("");
      // Retain authorName for ease of following interactions
    } catch (err: any) {
      console.error(err);
      setCommentsError("Submission rejected. Please ensure backend is compiled and online.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Dispatch prompt to our backend explain api
  const requestTechBriefing = async (topicStr: string) => {
    const query = topicStr || techTopic;
    if (!query.trim()) return;

    setTechTopic(query);
    setIsAiLoading(true);
    setAiError(null);
    setAiExplanation(null);

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: query })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Compiler pipeline returned status error.");
      }

      setAiExplanation(data.explanation);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Consultation request failed to reach server systems.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const popularPresetTopics = [
    "Zero-Knowledge Proofs",
    "Neural Radiance Fields",
    "WASM Edge Compilers",
    "Retrieval Augmented Generation"
  ];

  return (
    <section id="community-section" className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-16">
      
      {/* Title */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
          COMMUNITY & DISCUSSIONS
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-black tracking-tight text-darkBg dark:text-editorial leading-tight">
          Where Intellectual Minds Coalesce
        </h2>
        <p className="text-base text-neutral-600 dark:text-neutral-400 font-light">
          Join premium developers, product leads, and research analysts debating decentralized compute architectures and AI ethics limits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        
        {/* COLUMN 1 (lg:col-span-4): Trending Discussions Upvote Cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-neutral-800">
            <MessageSquare className="w-4 h-4 text-accentNeon" />
            <h3 className="font-serif text-xl font-bold text-darkBg dark:text-editorial">
              Trending Questions
            </h3>
          </div>

          <div className="space-y-4">
            {discussions.map((disc) => {
              const hasUpvoted = votedDiscList.includes(disc.id);
              return (
                <div
                  key={disc.id}
                  className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded">
                      {disc.category}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {disc.timeAgo}
                    </span>
                  </div>

                  <h4 className="font-sans text-sm font-semibold text-darkBg dark:text-editorial leading-snug">
                    "{disc.title}"
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-850">
                    <span className="text-xs text-neutral-500 font-light">
                      by <strong className="font-medium text-neutral-700 dark:text-neutral-300">{disc.author}</strong>
                    </span>
                    <div className="flex items-center space-x-3 text-xs">
                      <button
                        onClick={() => handleUpvoteDiscussion(disc.id)}
                        className={`flex items-center space-x-1.5 transition-colors ${
                          hasUpvoted
                            ? "text-accentNeon font-semibold bg-darkBg px-2 py-0.5 rounded-sm"
                            : "text-neutral-500 hover:text-darkBg dark:hover:text-editorial"
                        }`}
                        title="Upvote discussion"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{disc.votes}</span>
                      </button>
                      <span className="text-neutral-400 flex items-center space-x-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{disc.replies}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2 (lg:col-span-4): Reader Comments synched on Express Server */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-neutral-800">
            <MessageSquare className="w-4 h-4 text-accentNeon" />
            <h3 className="font-serif text-xl font-bold text-darkBg dark:text-editorial">
              General Comments
            </h3>
          </div>

          {/* Form write comment */}
          <form onSubmit={handleCommentSubmit} className="p-5 bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-xl space-y-3">
            <p className="text-[10px] font-mono uppercase text-neutral-400">
              Share your perspective
            </p>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Your designation name..."
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-editorial dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded focus:border-darkBg dark:focus:border-accentNeon text-darkBg dark:text-editorial outline-none"
              />
              <textarea
                placeholder="What limits of neural design are you currently confronting? Write here..."
                required
                rows={3}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                className="w-full text-xs p-3 bg-editorial dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded focus:border-darkBg dark:focus:border-accentNeon text-darkBg dark:text-editorial outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingComment}
              className="w-full py-2 bg-darkBg text-editorial dark:bg-accentNeon dark:text-darkBg font-bold text-xs rounded transition-transform active:scale-95 flex items-center justify-center space-x-2 hover:opacity-95"
            >
              <span>{isSubmittingComment ? "Deploying..." : "Publish comment"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Error notifications */}
          {commentsError && (
            <div className="p-3 bg-neutral-200 dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-800 rounded flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{commentsError}</span>
            </div>
          )}

          {/* Comments list stream */}
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-gray-100 dark:border-neutral-850 pb-3 last:border-b-0"
              >
                <div className="flex items-center space-x-2">
                  <div className="bg-neutral-200 dark:bg-neutral-800 p-1 rounded">
                    <User className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-darkBg dark:text-editorial">
                      {comment.author}
                    </h5>
                    <span className="text-[9px] text-neutral-400 font-mono">
                      {comment.timestamp}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light mt-1.5 pl-7">
                  {comment.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3 (lg:col-span-4): Custom TechSense AI Explainer */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-neutral-800">
            <Sparkles className="w-4 h-4 text-accentNeon" />
            <h3 className="font-serif text-xl font-bold text-darkBg dark:text-editorial">
              TechSense AI Explainer
            </h3>
          </div>

          <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4 text-editorial mesh-glow relative">
            <div className="absolute top-3 right-3 text-accentNeon animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Struggle representing complex tech? Input any computing architecture / trend term, and our server-bound Gemini agent will compile a classy editorial briefing.
            </p>

            {/* Input and trigger */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="e.g. Zero-Knowledge Proofs..."
                value={techTopic}
                onChange={(e) => setTechTopic(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-black border border-neutral-800 text-editorial rounded focus:border-accentNeon outline-none"
              />
              <button
                onClick={() => requestTechBriefing(techTopic)}
                disabled={isAiLoading || !techTopic.trim()}
                className="w-full bg-accentNeon text-darkBg font-bold text-xs py-2 rounded transition-transform active:scale-95 disabled:opacity-50"
              >
                {isAiLoading ? "Compiling Analysis..." : "Explain concept"}
              </button>
            </div>

            {/* Preset quick links */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-neutral-500 block uppercase">
                Or select premium concept:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {popularPresetTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => requestTechBriefing(topic)}
                    className="text-[9px] font-mono bg-neutral-800 text-neutral-300 hover:text-accentNeon hover:bg-black px-2 py-1 rounded border border-neutral-700 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic AI brief display */}
            <AnimatePresence>
              {isAiLoading && (
                <div className="py-6 text-center space-y-2 border-t border-neutral-800">
                  <div className="w-6 h-6 border-2 border-t-accentNeon border-accentNeon/20 rounded-full animate-spin mx-auto" />
                  <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 select-none">
                    Formulating semantic brief...
                  </p>
                </div>
              )}

              {aiExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-black/60 rounded border border-neutral-800 text-left overflow-y-auto max-h-[290px] prose dark:prose-invert"
                >
                  <p className="font-mono text-[9px] text-accentNeon font-bold uppercase tracking-wider mb-2">
                    COMPILED DECK // SUBJECT: {techTopic}
                  </p>
                  
                  {/* Custom quick formatter implementation */}
                  <div className="space-y-3 text-xs leading-relaxed font-light text-neutral-300">
                    {aiExplanation.split("\n").map((line, lIdx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;
                      
                      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                        return (
                          <h6 key={lIdx} className="font-mono text-[10px] font-bold text-white uppercase tracking-wider mt-4">
                            {trimmed.slice(2, -2)}
                          </h6>
                        );
                      }
                      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                        return (
                          <li key={lIdx} className="ml-3 list-disc pl-1 text-[11px] text-neutral-400">
                            {trimmed.slice(2)}
                          </li>
                        );
                      }
                      if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
                        return (
                          <h5 key={lIdx} className="font-serif text-sm font-semibold text-accentNeon mt-3">
                            {trimmed.replace(/^#+\s*/, "")}
                          </h5>
                        );
                      }
                      return <p key={lIdx} className="text-neutral-300">{trimmed}</p>;
                    })}
                  </div>
                </motion.div>
              )}

              {aiError && (
                <div className="p-3 bg-red-500/10 border border-red-500/35 text-red-400 text-xs rounded space-y-1">
                  <p className="font-semibold text-red-300 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-red-400" />
                    <span>Connection offline</span>
                  </p>
                  <p className="text-[10px] text-neutral-400 leading-snug">
                    {aiError}
                  </p>
                </div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </section>
  );
}
