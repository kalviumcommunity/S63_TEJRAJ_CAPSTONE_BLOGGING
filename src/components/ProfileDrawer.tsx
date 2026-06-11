import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flame, Shield, Award, Activity, Heart, Eye, CheckCircle2, Lock, Edit2, Check, Sparkles } from "lucide-react";
import { User } from "firebase/auth";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  likedCount: number;
  readCount: number;
  newsletterSubscribed: boolean;
  onSignOut: () => void;
}

export interface UserCustomProfile {
  nickname: string;
  bio: string;
  avatarUrl: string;
  avatarPreset: string;
  streak: number;
  lastCheckIn: string | null; // Date string format YYYY-MM-DD
  syncGoogle: boolean;
}

const PRESET_AVATARS = [
  { id: "neon_cyborg", name: "Neon Cyborg", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" },
  { id: "data_operator", name: "Data Operator", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80" },
  { id: "net_runner", name: "Net Runner", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80" },
  { id: "core_analyst", name: "Core Analyst", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" }
];

export default function ProfileDrawer({
  isOpen,
  onClose,
  user,
  likedCount,
  readCount,
  newsletterSubscribed,
  onSignOut
}: ProfileDrawerProps) {
  // Local profile states
  const [profile, setProfile] = useState<UserCustomProfile>({
    nickname: "",
    bio: "FutureScope subscriber inside node 2026.",
    avatarUrl: PRESET_AVATARS[0].url,
    avatarPreset: "neon_cyborg",
    streak: 0,
    lastCheckIn: null,
    syncGoogle: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editAvatarPreset, setEditAvatarPreset] = useState("neon_cyborg");
  const [editSyncGoogle, setEditSyncGoogle] = useState(true);
  const [showCheckInSparkle, setShowCheckInSparkle] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("futurescope_user_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile({
          nickname: parsed.nickname || "",
          bio: parsed.bio || "FutureScope subscriber inside node 2026.",
          avatarUrl: parsed.avatarUrl || PRESET_AVATARS[0].url,
          avatarPreset: parsed.avatarPreset || "neon_cyborg",
          streak: parsed.streak || 0,
          lastCheckIn: parsed.lastCheckIn || null,
          syncGoogle: parsed.syncGoogle !== undefined ? parsed.syncGoogle : true
        });
      } catch (e) {
        console.error("Failed to load user profile:", e);
      }
    }
  }, []);

  // Update edit form values when drawer opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setEditNickname(profile.nickname || (user?.displayName ? user.displayName.split(" ")[0] : "Cadet"));
      setEditBio(profile.bio);
      setEditAvatarUrl(profile.avatarUrl);
      setEditAvatarPreset(profile.avatarPreset);
      setEditSyncGoogle(profile.syncGoogle);
    }
  }, [isOpen, profile, user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserCustomProfile = {
      ...profile,
      nickname: editNickname,
      bio: editBio,
      avatarUrl: editAvatarPreset === "custom" ? editAvatarUrl : (PRESET_AVATARS.find(p => p.id === editAvatarPreset)?.url || PRESET_AVATARS[0].url),
      avatarPreset: editAvatarPreset,
      syncGoogle: editSyncGoogle
    };
    setProfile(updated);
    localStorage.setItem("futurescope_user_profile", JSON.stringify(updated));
    // Trigger custom event so Navbar or other components reload user profile immediately
    window.dispatchEvent(new Event("futurescope_profile_updated"));
    setIsEditing(false);
  };

  const handleCheckIn = () => {
    const today = new Date().toLocaleDateString("en-CA");
    if (profile.lastCheckIn === today) return; // Already checked in today

    let newStreak = profile.streak;
    if (!profile.lastCheckIn) {
      newStreak = 1;
    } else {
      const last = new Date(profile.lastCheckIn);
      const diffTime = Math.abs(new Date(today).getTime() - last.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else {
        newStreak = 1; // Streak broken, reset to 1
      }
    }

    const updated: UserCustomProfile = {
      ...profile,
      streak: newStreak,
      lastCheckIn: today
    };

    setProfile(updated);
    localStorage.setItem("futurescope_user_profile", JSON.stringify(updated));
    window.dispatchEvent(new Event("futurescope_profile_updated"));

    // Trigger streak highlight animation
    setShowCheckInSparkle(true);
    setTimeout(() => setShowCheckInSparkle(false), 2000);
  };

  const todayStr = new Date().toLocaleDateString("en-CA");
  const hasCheckedInToday = profile.lastCheckIn === todayStr;

  // Real-time Achievements calculations
  const achievements = [
    {
      id: "nexus_cadet",
      title: "Nexus Cadet",
      desc: "Connect to the telemetry net node (Active streak)",
      unlocked: profile.streak > 0,
      req: "Maintain a check-in streak of at least 1 day."
    },
    {
      id: "neural_decryptor",
      title: "Neural Decryptor",
      desc: "Decrypt critical archives in detail (Session reads)",
      unlocked: readCount >= 2,
      req: "Decrypt and read at least 2 articles in this session."
    },
    {
      id: "affinity_node",
      title: "Affinity Node",
      desc: "Establish neural bond with tech specs (Likes)",
      unlocked: likedCount >= 1,
      req: "Like at least 1 article to bond your cognitive vector."
    },
    {
      id: "future_intel_oracle",
      title: "Future Intel Oracle",
      desc: "Establish secure pipeline with forecasting network",
      unlocked: newsletterSubscribed || user !== null,
      req: "Secure network pipeline (Subscribe to newsletter or Login via Google)."
    }
  ];

  // Resolve display avatar and nickname based on state
  const activeName = (profile.syncGoogle && user?.displayName) ? user.displayName : (profile.nickname || user?.displayName || "Nexus Cadet");
  const activeAvatar = (profile.syncGoogle && user?.photoURL) ? user.photoURL : (profile.avatarUrl || user?.photoURL || PRESET_AVATARS[0].url);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-darkBg/60 backdrop-blur-xs">
          {/* Overlay Click-shield */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Terminal Drawer Side panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="relative flex flex-col w-full max-w-md h-full bg-[#0b0b0d] border-l border-neutral-800 text-editorial p-6 shadow-2xl overflow-y-auto"
          >
            {/* Cyberpunk Terminal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-accentNeon rounded-full animate-ping" />
                <h2 className="font-mono text-xs font-black uppercase tracking-widest text-accentNeon">
                  TERMINAL_SPECS // SECURE_USER
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                {user && (
                  <button
                    onClick={() => {
                      onSignOut();
                      onClose();
                    }}
                    className="text-[9px] font-mono font-bold text-red-500 hover:text-red-400 hover:scale-105 transition-all uppercase cursor-pointer bg-red-950/20 border border-red-900/30 px-2.5 py-1 rounded"
                    title="Sign Out Google Session"
                  >
                    Logout
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 text-neutral-400 hover:text-accentNeon hover:scale-110 transition-all cursor-pointer bg-neutral-900 border border-neutral-850 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Overview (Sign out, details) */}
            <div className="mt-6 flex flex-col items-center text-center space-y-4">
              {/* Profile Portrait with Pulse Rings */}
              <div className="relative group">
                <div className="absolute inset-0 rounded-full border-2 border-accentNeon/40 scale-110 animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-dashed border-accentNeon/20 scale-125 animate-spin-slow" />
                <img
                  src={activeAvatar}
                  alt={activeName}
                  className="w-24 h-24 rounded-full object-cover border-2 border-accentNeon shadow-lg relative z-10"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80";
                  }}
                />
              </div>

              {/* Profile Identity display */}
              {!isEditing ? (
                <div className="space-y-1 relative z-10 w-full">
                  <div className="flex items-center justify-center space-x-1.5">
                    <h3 className="font-serif text-xl font-bold tracking-tight text-white">
                      {activeName}
                    </h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 hover:text-accentNeon hover:bg-neutral-900 rounded transition-colors"
                      title="Edit Identity Specs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                    </button>
                  </div>
                  <p className="text-xs text-accentNeon font-mono tracking-wider">
                    {user ? "AUTHENTICATED GOOGLE COMPATIBLE" : "LOCAL COGNITIVE LINK"}
                  </p>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto italic font-light font-sans pt-1">
                    "{profile.bio}"
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="w-full text-left bg-neutral-900/50 p-4 border border-neutral-800 rounded-xl space-y-4">
                  <h4 className="font-mono text-[9px] font-bold text-accentNeon uppercase tracking-wider pb-1 border-b border-neutral-800">
                    EDIT IDENTITY CONFIG
                  </h4>

                  {user && (
                    <div className="flex items-center space-x-2 bg-black border border-neutral-850 px-3 py-2 rounded-lg">
                      <input
                        type="checkbox"
                        id="checkbox-sync-google"
                        checked={editSyncGoogle}
                        onChange={(e) => {
                          setEditSyncGoogle(e.target.checked);
                          if (e.target.checked) {
                            setEditNickname(user.displayName?.split(" ")[0] || "Cadet");
                          }
                        }}
                        className="accent-accentNeon bg-black border border-neutral-800 rounded w-3.5 h-3.5 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="checkbox-sync-google" className="text-[9px] font-mono uppercase text-neutral-400 cursor-pointer select-none">
                        SYNC NICKNAME & PORTRAIT WITH GOOGLE
                      </label>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-[8px] font-mono uppercase text-neutral-500 mb-1">NICKNAME</label>
                    <input
                      type="text"
                      required
                      disabled={editSyncGoogle && !!user}
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      placeholder="e.g. CyberCadet"
                      maxLength={18}
                      className={`w-full text-xs px-3 py-2 bg-black border border-neutral-800 text-white rounded-lg focus:outline-none focus:border-accentNeon outline-none ${
                        editSyncGoogle && user ? "opacity-50 cursor-not-allowed border-neutral-850" : ""
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-mono uppercase text-neutral-500 mb-1">COGNITIVE BIO</label>
                    <textarea
                      rows={2}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Enter a futuristic biography..."
                      maxLength={100}
                      className="w-full text-xs px-3 py-2 bg-black border border-neutral-800 text-white rounded-lg focus:outline-none focus:border-accentNeon outline-none resize-none"
                    />
                  </div>

                  <div className={editSyncGoogle && user ? "opacity-50 pointer-events-none" : ""}>
                    <label className="block text-[8px] font-mono uppercase text-neutral-500 mb-2.5">PORTRAIT PRESETS</label>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          disabled={editSyncGoogle && !!user}
                          onClick={() => {
                            setEditAvatarPreset(av.id);
                            setEditAvatarUrl(av.url);
                          }}
                          className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            editAvatarPreset === av.id ? "border-accentNeon scale-105" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={editSyncGoogle && !!user}
                        onClick={() => setEditAvatarPreset("custom")}
                        className={`text-[9px] font-mono rounded-full border-2 flex items-center justify-center cursor-pointer transition-all aspect-square ${
                          editAvatarPreset === "custom" ? "border-accentNeon bg-accentNeon text-darkBg" : "border-neutral-700 bg-black text-neutral-400 hover:border-neutral-500"
                        }`}
                      >
                        CUSTOM
                      </button>
                    </div>
                  </div>

                  {editAvatarPreset === "custom" && (!editSyncGoogle || !user) && (
                    <div className="pt-1">
                      <label className="block text-[8px] font-mono uppercase text-neutral-500 mb-1">AVATAR IMAGE URL</label>
                      <input
                        type="url"
                        required
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        placeholder="https://example.com/portrait.jpg"
                        className="w-full text-xs px-3 py-2 bg-black border border-neutral-800 text-white rounded-lg focus:outline-none focus:border-accentNeon outline-none"
                      />
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-accentNeon text-darkBg text-xs font-bold py-2 rounded-lg hover:bg-hoverNeon transition-all cursor-pointer inline-flex items-center justify-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Config</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 bg-neutral-800 hover:bg-neutral-700 text-xs py-2 rounded-lg text-neutral-350 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Telemetry Stats Footprint */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center space-x-1 border-b border-neutral-850 pb-2">
                <Activity className="w-4 h-4 text-accentNeon" />
                <h4 className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-white">
                  FOOTPRINT_TELEMETRY
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-neutral-900/40 p-3 border border-neutral-850 rounded-xl space-y-1">
                  <span className="block text-[8px] text-neutral-500 uppercase">Liked Secrets</span>
                  <div className="flex items-center space-x-1.5">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span className="text-lg font-bold text-white">{likedCount} items</span>
                  </div>
                </div>
                <div className="bg-neutral-900/40 p-3 border border-neutral-850 rounded-xl space-y-1">
                  <span className="block text-[8px] text-neutral-500 uppercase">Decrypted Volumes</span>
                  <div className="flex items-center space-x-1.5">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-lg font-bold text-white">{readCount} specs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Daily Check-In */}
            <div className="mt-8 space-y-3 relative">
              <div className="flex items-center space-x-1 border-b border-neutral-850 pb-2">
                <Flame className="w-4 h-4 text-accentNeon" />
                <h4 className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-white">
                  DAILY_CHECKIN // SYNAPSE
                </h4>
              </div>
              
              <div className="bg-neutral-900/20 border border-neutral-850 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                <div className="space-y-1 relative z-10">
                  <div className="flex items-center space-x-2">
                    <Flame className={`w-6 h-6 text-orange-500 ${profile.streak > 0 && user ? "animate-pulse" : "opacity-35"}`} />
                    <span className="text-2xl font-serif font-black text-white">{user ? profile.streak : 0}</span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">Day Streak</span>
                  </div>
                  <p className="text-[9px] text-neutral-500 leading-snug">
                    {!user
                      ? "Authenticate with Google to initiate your cognitive check-in streak."
                      : hasCheckedInToday
                      ? "Your neural connection is fully charged for today."
                      : "Synchronize your cognitive streak today to gain bandwidth."}
                  </p>
                </div>
                
                <button
                  onClick={handleCheckIn}
                  disabled={hasCheckedInToday || !user}
                  className={`relative shrink-0 font-mono text-[9px] font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                    !user
                      ? "bg-neutral-950 border-neutral-900 text-neutral-600 cursor-not-allowed"
                      : hasCheckedInToday
                      ? "bg-neutral-850 border-neutral-800 text-neutral-500 cursor-not-allowed"
                      : "bg-accentNeon border-accentNeon text-darkBg hover:bg-hoverNeon hover:shadow-lg shadow-accentNeon/5"
                  }`}
                >
                  {!user ? "LOCKED" : hasCheckedInToday ? "SYNCED" : "SYNCHRONIZE"}
                </button>
              </div>

              {/* Celebration Overlay for Check-in Streak Increase */}
              <AnimatePresence>
                {showCheckInSparkle && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-accentNeon/10 border border-accentNeon/30 rounded-xl flex items-center justify-center backdrop-blur-xs z-25"
                  >
                    <div className="text-center space-y-1.5">
                      <Sparkles className="w-8 h-8 text-accentNeon mx-auto animate-bounce" />
                      <p className="font-serif text-sm font-bold text-white">Streak Decrypted!</p>
                      <p className="font-mono text-[9px] text-accentNeon font-black uppercase">Streak count: {profile.streak} Days</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Lockable Trophies Achievements Matrix */}
            <div className="mt-8 space-y-3 pb-8">
              <div className="flex items-center space-x-1 border-b border-neutral-850 pb-2">
                <Award className="w-4 h-4 text-accentNeon" />
                <h4 className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-white">
                  TROPHY_ACHIEVEMENTS
                </h4>
              </div>
              
              <div className="space-y-2.5">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`flex items-start space-x-3.5 p-3.5 border rounded-xl transition-all ${
                      ach.unlocked
                        ? "bg-neutral-900/30 border-accentNeon/30 hover:border-accentNeon/50"
                        : "bg-neutral-950 border-neutral-900 opacity-60"
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 border ${
                      ach.unlocked 
                        ? "bg-accentNeon/10 border-accentNeon/20 text-accentNeon" 
                        : "bg-neutral-900 border-neutral-850 text-neutral-600"
                    }`}>
                      {ach.unlocked ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex-1 space-y-0.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-serif font-black ${ach.unlocked ? "text-white" : "text-neutral-500"}`}>
                          {ach.title}
                        </span>
                        <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          ach.unlocked ? "bg-accentNeon/20 text-accentNeon" : "bg-neutral-900 text-neutral-600"
                        }`}>
                          {ach.unlocked ? "UNLOCKED" : "LOCKED"}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-light font-sans leading-tight">
                        {ach.desc}
                      </p>
                      {!ach.unlocked && (
                        <p className="text-[8px] font-mono text-neutral-500 tracking-tight">
                          REQ: {ach.req}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
