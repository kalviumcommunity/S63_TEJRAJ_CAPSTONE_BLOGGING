import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Establish __dirname & __filename equivalents in ES Module mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database for Comments (synced across client sessions)
interface CommentRecord {
  id: string;
  articleId: string;
  author: string;
  body: string;
  timestamp: string;
}

const dbComments: CommentRecord[] = [
  {
    id: "c1",
    articleId: "pulse-of-tomorrow",
    author: "Tejraj487",
    body: "This editorial perspective is exactly what we need in 2026. Aesthetic refinement must override standard infinite feeds.",
    timestamp: "10 Jun 2026, 12:44"
  },
  {
    id: "c2",
    articleId: "pulse-of-tomorrow",
    author: "Aiden_Core",
    body: "Agreed. Web layouts have been boringly uniform for a decade. Looking forward to more modular designs.",
    timestamp: "10 Jun 2026, 14:12"
  },
  {
    id: "c3",
    articleId: "vibe-collective",
    author: "Elena_V",
    body: "Minimal bio-resonant rings sound surreal. No displays, just sensory rhythms. Count me in.",
    timestamp: "11 Jun 2026, 09:30"
  },
  {
    id: "c4",
    articleId: "general",
    author: "Nils_B",
    body: "FutureScope is beautiful—feels very close to reading a tactile high-fashion magazine.",
    timestamp: "12 Jun 2026, 08:15"
  }
];

// Lazy-initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// REST APIs
// 1. Get and post comments
app.get("/api/comments", (req, res) => {
  const { articleId } = req.query;
  if (articleId) {
    const filtered = dbComments.filter(c => c.articleId === articleId);
    return res.json({ comments: filtered });
  }
  res.json({ comments: dbComments });
});

app.post("/api/comments", (req, res) => {
  const { articleId, author, body } = req.body;
  if (!author || !body) {
    return res.status(400).json({ error: "Author and body are required." });
  }
  const newComment: CommentRecord = {
    id: `c_${Date.now()}`,
    articleId: articleId || "general",
    author,
    body,
    timestamp: new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }) + ", " + new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })
  };
  dbComments.unshift(newComment);
  res.status(201).json({ success: true, comment: newComment });
});

// 2. Newsletter Subscription API with synthetic future AI prediction!
app.post("/api/newsletter/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  let futurePrediction = "Thank you for subscribing! As a premium member, you will receive our handcrafted technological forecasts every Tuesday.";

  try {
    const client = getGeminiClient();
    const prompt = `The user with email "${email}" has subscribed to "FutureScope", a premium technology and AI magazine-style blog.
Generate a highly sophisticated, editorial, one-sentence futuristic forecasting greeting tailored to them. 
Make it feel intellectual, premium, and futuristic (Wired-style). Mention their email domain name or make a classy tech-themed forecast. Limit to 30 words.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    if (response.text) {
      futurePrediction = response.text.trim();
    }
  } catch (error: any) {
    console.warn("Newsletter Gemini generation skipped or failed, using default greeting:", error.message);
  }

  res.json({
    success: true,
    message: "Subscription processed successfully.",
    prediction: futurePrediction
  });
});

// 3. AI Blog Summarizer API
app.post("/api/ai/summarize", async (req, res) => {
  const { title, description, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Missing title or content parameter to summarize." });
  }

  try {
    const client = getGeminiClient();
    const articleBody = Array.isArray(content) ? content.join("\n\n") : content;
    const prompt = `You are the Lead Artificial Intelligence Editor at FutureScope, a luxury tech and culture magazine.
Create a highly polished, executive editorial summary of the following article in a premium Markdown format.

ARTICLE TITLE: ${title}
ARTICLE ABSTRACT: ${description || "N/A"}
ARTICLE BODY:
${articleBody}

Generate your response in exactly 2 distinct sections:
1. "SYNAPSE SUMMARY" - A single elegant paragraph summarizing the core intellectual impact (3-4 sentences total).
2. "KEY TREND SPOTS" - Exactly 3 sophisticated, brief bullet points outlining the crucial technological or design takeaways from this article.

Do not output any introductory greetings, meta-comments or standard chatbot preambles. Output clean markdown directly.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    res.json({
      success: true,
      summary: response.text || "Unable to formulate a summary."
    });
  } catch (error: any) {
    console.error("Gemini summarize error:", error);
    res.status(500).json({
      error: "Failed to assemble executive summary. Please ensure your GEMINI_API_KEY is configured in the secrets panel.",
      details: error.message
    });
  }
});

// 3b. AI Quick Bullet Summarizer API
app.post("/api/ai/quick-summary", async (req, res) => {
  const { title, description, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Missing title or content parameter to summarize." });
  }

  try {
    const client = getGeminiClient();
    const articleBody = Array.isArray(content) ? content.join("\n\n") : content;
    const prompt = `You are a visionary editor at FutureScope.
Analyze the article and output exactly 3 concise, high-impact bullet points summarizing are:
1. The Core Innovation or Paradox
2. The Key Catalyst or Evidence
3. The Future Outlook/Impact

ARTICLE TITLE: ${title}
ARTICLE ABSTRACT: ${description || "N/A"}
ARTICLE BODY:
${articleBody}

Output format:
- Bullet 1
- Bullet 2
- Bullet 3

Ensure there are no headers, greeting text, preamble, or trailing commentary. Just return exactly 3 bullet points starting with the character "-", each on its own line.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    res.json({
      success: true,
      summary: response.text || "Unable to compile quick summary."
    });
  } catch (error: any) {
    console.error("Gemini quick summary error:", error);
    res.status(500).json({
      error: "Could not fetch AI summary. Verify that your GEMINI_API_KEY is configured in Secrets.",
      details: error.message
    });
  }
});

// 4. AI Complex Tech Explainer API
app.post("/api/ai/explain", async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "No technology topic provided." });
  }

  try {
    const client = getGeminiClient();
    const prompt = `You are a visionary technological researcher for FutureScope Magazine.
Provide a premium, intellectual, and clear breakdown of this high-technology or computer science concept: "${topic}"

Craft your response in markdown format with:
- "The Essence": A simple, crystal-clear analogy or explanation that a 15-year-old or CEO could easily absorb in 30 seconds.
- "The Deep Architecture": A brief technical explanation of the real hardware, algorithmic, or compiler mechanics.
- "Future Scope": How this specific concept is set to revolutionize the technological horizon in 2026-2030.

Keep the tone highly professional, lucid, and visually structured. Avoid chatbot filler text. Match the Apple Editorial aesthetic. Limit response to 200 words.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    res.json({
      success: true,
      explanation: response.text || "No explanation compiled."
    });
  } catch (error: any) {
    console.error("Gemini explain error:", error);
    res.status(500).json({
      error: "Consultation pipeline offline. Please configure your GEMINI_API_KEY in Settings > Secrets.",
      details: error.message
    });
  }
});

// Setup Vite Dev server or Production static folders
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Import Vite dynamically to support dev server middleware
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FutureScope Server] Listening on http://localhost:${PORT} under NODE_ENV=${process.env.NODE_ENV || "development"}`);
  });
}

startServer().catch(err => {
  console.error("Fatal server start error:", err);
});
