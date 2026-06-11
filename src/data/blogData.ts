import { Article, Author, PodcastEpisode, Discussion } from "../types";

export const authors: Author[] = [
  {
    id: "robert-paul",
    name: "Robert Paul",
    role: "Chief AI Analyst & Editor",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Robert focuses on the intersection of deep neural networks, machine ethics, and future cognitive agents. Formerly a research fellow at Sorbonne.",
    city: "Nairobi",
    specialty: "Machine Learning & Ethics",
    socials: {
      twitter: "https://twitter.com/robertpaul",
      github: "https://github.com/robertpaul",
      linkedin: "https://linkedin.com/in/robertpaul",
    }
  },
  {
    id: "james-pitersburg",
    name: "James Pitersburg",
    role: "Tech Columnist & Futurist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Co-founder of several successful tech ventures. James writes about micro-systems, cloud economics, hardware startups, and decentralized computation paradigms.",
    city: "Berlin",
    specialty: "High-Performance Compute",
    socials: {
      twitter: "https://twitter.com/jamesp",
      linkedin: "https://linkedin.com/in/jamesp",
    }
  },
  {
    id: "jhon-rupert",
    name: "Jhon Rupert",
    role: "Core Software Architect",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Creator of several open-source rendering libraries. Author of 'Modern Web Compilation: Beyond V8' and developer advocate for premium software craftsmanship.",
    city: "Richmond",
    specialty: "Compilers & Web Systems",
    socials: {
      github: "https://github.com/jhonrupert",
      twitter: "https://twitter.com/jhonrupert",
    }
  },
  {
    id: "roman-rouf",
    name: "Roman Rouf",
    role: "SecOps Lead & Threat Hunter",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Penetration tester and blockchain security advisor. Roman assists Fortune 200 enterprises in hardening zero-trust architectures and investigating persistent payloads.",
    city: "Dhaka",
    specialty: "Zero-Trust & Cryptography",
    socials: {
      github: "https://github.com/romanrouf",
      linkedin: "https://linkedin.com/in/romanrouf",
    }
  }
];

export const articles: Article[] = [
  {
    id: "pulse-of-tomorrow",
    title: "The Pulse of Tomorrow: Where Tech Meets Taste, Style, & Neural Synthesis",
    description: "Deep dive into the aesthetic revolution of 2026. How consumer technology, AI model architectures, and tailored editorial frameworks are shaping human aesthetics.",
    body: [
      "In the digital renaissance of 2026, technology is no longer merely functional. It has transformed into an active co-creator of human taste and aesthetic language. From generative layout agents to wearable silicon interfaces, the border between carbon and silicon tastes has dissolved completely.",
      "Consider the modern creative studio. Neural synthesis frameworks aren’t just generating static assets; they are dynamically listening to cultural micro-waves and outputting interactive, high-fidelity systems in real-time. This is the origin of 'Tech-Aestheticism'—a state where algorithm precision is married to raw organic curiosity.",
      "As we transition deeper into this post-compute epoch, our interfaces must follow suit. They must feel luxurious, patient, and editorial. We are moving away from loud, fluorescent micro-interactions toward respectful, high-contrast typography, off-white negative space, and responsive motion that honors human attention.",
      "The true challenge for developers and designers today is not processing speed, but semantic pacing. We must design software that reads less like an over-crowded telemetry terminal and more like an award-winning monograph. It’s about building digital spaces that elevate, expand, and inspire the modern intellect."
    ],
    cover: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    category: "AI",
    author: authors[0],
    date: "12 JUN 2026",
    readTime: "12 MINS",
    featured: true,
    trending: true,
    likes: 412
  },
  {
    id: "vibe-collective",
    title: "Vibe Collective: How Neural Wearables are Redefining Fashion & Fitness Systems",
    description: "An analysis of ambient bio-sensing, smart jewelry, and how biometric telemetry merges with fashion design, creating a fluid synergy of self-expression and wellness.",
    body: [
      "The wearable technology sector has undergone a profound aesthetic mutation. What once was characterized by industrial plastic bands and flashing LEDs is now represented by organic precious metals, smart thread weave, and completely passive biometric resonance.",
      "The 'Vibe Collective' represents a movement of pioneers designing on-skin sensors that act as elegant sensory nodes. They don't scream for your attention with continuous push notifications; rather, they communicate through whisper-haptic feedback and slow-ambient light transitions on hand-polished surfaces.",
      "By integrating lightweight neural networks directly into local smart jewelry micro-processors, these wearables learn daily cortisol rhythms and nervous system load. Instead of throwing arbitrary step targets, they coordinate with ambient lighting and domestic acoustic devices to synthesize spaces tailored to the user's autonomic tone.",
      "This is design acting not just as style, but as physiological stabilization. When technology becomes this intimate, it ceases to be a tool—it becomes an organic extension of the body's natural envelope, styled with the sophistication of high-fashion editorial."
    ],
    cover: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80",
    category: "Technology",
    author: authors[1],
    date: "10 JUN 2026",
    readTime: "9 MINS",
    featured: true,
    trending: true,
    likes: 289
  },
  {
    id: "edge-and-essence",
    title: "Edge & Essence: Compiling the Next Decade of Declarative Web Architectures",
    description: "Surgical inspection of the transition from dense clients to lightweight distributed nodes. How custom edge runtimes are rendering V8-dependence secondary.",
    body: [
      "The browser is no longer a passive container for standard documents—it has evolved into a hyper-threaded virtual runtime. With compile-to-wasm frameworks and edge-native synthesis, the classic separation between server-side data stores and client rendering engines is fading into database history.",
      "We are seeing a severe pivot toward lightweight, reactive serverless compilation. The next decade's standard involves deploying self-contained, type-safe binaries straight to decentralized mesh nodes. By bypassing complex asset serialization steps completely, page initiation times fall well below 10 milliseconds globally.",
      "But this structural advancement demands a parallel design re-evaluation. Slow loading skeletons and jarring layout shifts are unacceptable in premium digital publishing. If data loads instantly at the edge, our client architectures must translate this speed into visual fluid-motion, using smooth hardware-accelerated translations.",
      "We trace several compiler architectures (HyperJS, Rust-Wasm-Bridges) to demonstrate how eliminating heavy runtime interpretation overhead allows browsers to dedicate hardware resources entirely to rendering highly polished typography and organic interactive transitions."
    ],
    cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    category: "Programming",
    author: authors[2],
    date: "08 JUN 2026",
    readTime: "15 MINS",
    featured: true,
    likes: 356
  },
  {
    id: "life-circuit",
    title: "Life Circuit: Hardware Startups Designing Respectful Domestic Technology",
    description: "Inside the laboratories of the anti-alert hardware revolution. How startup teams are building physical items designed to resist distraction culture.",
    body: [
      "For the past fifteen years, consumer hardware has been dominated by the attention economy—every beep, screen, and glow was designed to optimize screen time and click-through rates. Today, a new wave of hardware startups is staging a quiet rebellion.",
      "Dubbed the 'Life Circuit', these designers are crafting household electronics out of raw materials: brushed steel, textured walnut, linen fabrics, and e-paper displays. They are deliberately stripping out hyper-bright OLED screens in favor of physics-first interactions—physical knobs, mechanical levers, and warm acoustic chimes.",
      "We look at three hardware startup entities implementing this minimalist Philosophy. Their products range from dynamic ambient calendars to desktop noise filters. By storing data in locally-bound databases and avoiding persistent cloud requirements, these products protect absolute cognitive privacy.",
      "The modern premium tech product doesn't demand your attention; it complements your room. It is designed to sit peacefully on a marble credenza, blending seamlessly with the environment while standing ready to assist on a tactile squeeze. Real luxury is the confidence to remain offline."
    ],
    cover: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    category: "Startups",
    author: authors[1],
    date: "06 JUN 2026",
    readTime: "11 MINS",
    featured: true,
    likes: 198
  },
  {
    id: "cyber-stealth",
    title: "Stealth Vectors: Decrypting the Threat Matrix of Autonomous Neural Payloads",
    description: "An investigative overview of self-learning exploit vectors that bypass signature scanners. Why modern cybersecurity requires real-time generative resilience.",
    body: [
      "The classic era of cybersecurity was defensive and reaction-based: compile a database of threat signatures, identify incoming matches, and quarantine the associated file. General security agents was a game of cataloging known patterns.",
      "That paradigm has collapsed before our eyes. The arrival of self-synthesizing neural payloads has shifted threat scenarios into a hyper-dynamic cyber-offensive. Modern payloads can actively analyze host security rules, re-compile their own binary structures in memory, and simulate standard system traffic.",
      "To counter autonomous payloads, threat analysts are utilizing generator guards. These security networks simulate hundreds of speculative futures inside sandboxed hosts, predicting payload shifts before they manifest in production. It is a live-simulation battle occurring at microsecond scales.",
      "For modern engineers, this signals a massive shift toward absolute immutable systems. Every server route, security boundary, and database transaction must be verified through cryptographic proofs. Zero-trust is no longer a trendy marketing slogan—it is the baseline architecture for preserving digital continuity."
    ],
    cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    category: "Cybersecurity",
    author: authors[3],
    date: "04 JUN 2026",
    readTime: "14 MINS",
    likes: 521
  },
  {
    id: "quantum-jump",
    title: "The Quantum Jump: A Developer's Practical Guide to Qubit-Based Algorithms",
    description: "Skip the heavy linear algebra. A logical breakdown of quantum state registers, gate superposition, and how to write your first QASM simulation script.",
    body: [
      "Quantum computing is rapidly descending from theoretical physics labs into general developer environments. You do not need a deep doctorate in quantum mechanics to begin writing qubit-based logic—you simply need to adapt your algorithmic flow.",
      "Unlike classical bits which are bound to rigid binary states (zero or one), quantum registers operate within a spherical probability amplitude called the Bloch Sphere. By manipulating gate operations, qubits are placed into interference alignments where multiple outcomes can be computed in parallel.",
      "In this comprehensive tutorial, we cover the core gates: the Hadamard (H) gate to establish superposition, the CNOT gate for multi-qubit entanglement, and the Phase-Shift gate for probability tuning. We then execute a simple search routine on virtual cloud platforms.",
      "By understanding the behavior of state persistence and phase coordination, general software engineers can immediately begin preparing system code for the quantum processing units (QPUs) that are set to revolutionize cryptography, molecule modeling, and high-dimensional optimization."
    ],
    cover: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
    category: "Tutorials",
    author: authors[2],
    date: "01 JUN 2026",
    readTime: "18 MINS",
    likes: 310
  }
];

export const podcastEpisodes: PodcastEpisode[] = [
  {
    id: "pod-1",
    title: "Episode 42: Synthesizing Consciousness — The Next Phase of Generative Agents",
    description: "We are joined by Dr. Robert Paul to break down the technical breakthroughs of multi-agent cognitive loops, sovereign digital memory architectures, and of course, machine ethics.",
    coverUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=300&h=300&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "45:12",
    date: "08 JUN 2026",
    episodeNumber: 42
  },
  {
    id: "pod-2",
    title: "Episode 41: Hardware is Hard (But Worth It) — Building the Respectful Device",
    description: "James Pitersburg is in the studio debating why electronic devices need a physical hardware overhaul. We discuss why high-quality materials and e-paper displays are making a massive comeback.",
    coverUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=300&h=300&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "38:45",
    date: "25 MAY 2026",
    episodeNumber: 41
  },
  {
    id: "pod-3",
    title: "Episode 40: Compilers, V8, and compilation shortcuts representing modern frontend speeds",
    description: "An absolute deep-dive into compiler architecture with Jhon Rupert, detailing the creation of lightweight web environments and how compiling directly to WASM cuts browser heavy lifts.",
    coverUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=300&h=300&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "52:10",
    date: "12 MAY 2026",
    episodeNumber: 40
  }
];

export const discussions: Discussion[] = [
  {
    id: "disc-1",
    title: "Will local LLaMAs completely replace centralized SaaS AI APIs for consumer applications in 2 years?",
    author: "Tejraj487",
    category: "AI",
    votes: 89,
    replies: 24,
    timeAgo: "4 hours ago"
  },
  {
    id: "disc-2",
    title: "Is Tailwind v4's direct CSS imports causing any compilation performance drops on very large architectures?",
    author: "jhon-rupert",
    category: "Programming",
    votes: 114,
    replies: 18,
    timeAgo: "1 day ago"
  },
  {
    id: "disc-3",
    title: "Zero-Trust microsegmentation: how to handle transient IoT connections without clogging subnet routing rules?",
    author: "cyber_sec_guru",
    category: "Cybersecurity",
    votes: 62,
    replies: 12,
    timeAgo: "2 days ago"
  }
];

export const categories: string[] = [
  "Artificial Intelligence",
  "Technology",
  "Programming",
  "Startups",
  "Cybersecurity",
  "Tutorials",
  "Blockchain",
  "Cloud Computing",
  "Data Science"
];
