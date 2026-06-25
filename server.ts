import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";


dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please add it via the Settings > Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/ask", async (req, res) => {
    try {
      const { query, language, knowledgeBase } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      // Format knowledge base for the prompt
      let kbContext = "";
      if (knowledgeBase && Array.isArray(knowledgeBase)) {
        kbContext = knowledgeBase
          .filter((k: any) => !k.lang || k.lang === language)
          .map((k: any) => `Title: ${k.title}\nContent: ${k.content}`)
          .join("\n\n");
      }

      const prompt = `You are a helpful and knowledgeable AI advisor for LifeWave wellness products.
Respond in the following language: ${language === 'zh' ? 'Chinese (Simplified)' : 'English'}.

You have access to the following knowledge base:
${kbContext}

Use this knowledge base to answer the user's question. If the answer is not in the knowledge base, answer based on your general knowledge about health, wellness, and LifeWave, but be helpful, professional, and do not make unsubstantiated medical claims. Emphasize that these are wellness products and not medical treatments. You can also provide resources and links if helpful. Use markdown for formatting the detailed answer.

Provide your response in a JSON structure containing:
1. "summary": A concise, highly readable, 1-2 sentence quick summary of the key recommendations or patches.
2. "answer": The full, detailed markdown-formatted comprehensive answer.

User Question: ${query}`;

      const gemini = getGeminiClient();
      const modelsToTry = [
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-latest"
      ];

      let response = null;
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          console.log(`[Gemini] Attempting to generate structured content using model: ${modelName}`);
          response = await gemini.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: "You are an expert AI advisor for LifeWave products. Provide clear, supportive, and informative answers in JSON format. Always include the standard wellness disclaimer if giving health advice.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  summary: {
                    type: Type.STRING,
                    description: "A highly concise, 1-2 sentence quick summary of the key phototherapy patch recommendations and their main benefits.",
                  },
                  answer: {
                    type: Type.STRING,
                    description: "The full, detailed markdown-formatted answer answering the user's question, describing protocols, patch placements, and including standard wellness disclaimers.",
                  }
                },
                required: ["summary", "answer"],
              }
            }
          });
          if (response && response.text) {
            console.log(`[Gemini] Successfully generated structured content using model: ${modelName}`);
            break;
          }
        } catch (err: any) {
          console.warn(`[Gemini] Warning: Model ${modelName} failed or unavailable:`, err.message || err);
          lastError = err;
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error("All fallback models failed to generate content.");
      }

      let finalAnswer = "";
      let finalSummary = "";

      const textOutput = response.text.trim();
      try {
        if (textOutput.startsWith("{")) {
          const parsed = JSON.parse(textOutput);
          finalAnswer = parsed.answer || "";
          finalSummary = parsed.summary || "";
        } else {
          finalAnswer = textOutput;
          finalSummary = textOutput.split("\n")[0] || "LifeWave phototherapy recommendations.";
        }
      } catch (jsonErr) {
        console.warn("[Gemini] JSON parsing error, using raw text fallback:", jsonErr);
        finalAnswer = textOutput;
        finalSummary = textOutput.substring(0, 150) + "...";
      }

      res.json({ answer: finalAnswer, summary: finalSummary });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate answer." });
    }
  });

  app.post("/api/lead", async (req, res) => {
    try {
      const { name, email, selectedGoals, recommendedProducts, language, subscribeInsights } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: "Name and Email are required." });
      }

      console.log(`[Lead Received] Name: ${name}, Email: ${email}, Language: ${language}, Subscribe Insights: ${subscribeInsights}`);
      console.log(`[Lead Goals]`, selectedGoals);
      console.log(`[Lead Recommendations]`, recommendedProducts);

      const emailSubject = `Daily Radiance Lead - ${name} (${language === 'zh' ? 'Chinese' : 'English'})`;
      const emailBody = `
Daily Radiance - New Lead Wellness Plan Recommendation

Lead Contact Information:
-------------------------
Name: ${name}
Email: ${email}
Language: ${language === 'zh' ? 'Chinese (Simplified)' : 'English'}
Newsletter Subscription: ${subscribeInsights ? "Subscribed to Phototherapy Wellness Insights (Yes)" : "No"}

Selected Wellness Goals:
------------------------
${selectedGoals && Array.isArray(selectedGoals) ? selectedGoals.map((g: string) => `- ${g}`).join('\n') : "None specified"}

Recommended LifeWave Products:
------------------------------
${recommendedProducts && Array.isArray(recommendedProducts) ? recommendedProducts.map((p: string) => `- ${p}`).join('\n') : "None specified"}

--
Sent from Daily Radiance Partner Portal.
`;

      let emailSent = false;
      let emailError = "";

      // 1. Try SMTP if configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        try {
          const portNum = parseInt(process.env.SMTP_PORT || "587");
          const isSecure = process.env.SMTP_SECURE !== undefined 
            ? process.env.SMTP_SECURE === "true" 
            : portNum === 465;

          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: portNum,
            secure: isSecure,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'Daily Radiance Advisor'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: `${email}, lightup365nz@gmail.com`,
            subject: emailSubject,
            text: emailBody,
          });

          emailSent = true;
          console.log(`[Lead SMTP] Email successfully sent via SMTP to ${email} and lightup365nz@gmail.com`);
        } catch (smtpErr: any) {
          console.error("[Lead SMTP Error]", smtpErr);
          const errMsg = smtpErr.message || "";
          if (errMsg.includes("535") || errMsg.toLowerCase().includes("accepted") || errMsg.toLowerCase().includes("auth") || errMsg.toLowerCase().includes("login")) {
            emailError = `SMTP Auth Error (535): Invalid username or password. If you are using Gmail (smtp.gmail.com), you cannot use your regular account password. You must use a 16-character Google 'App Password'. To create one: Go to Google Account -> Security -> 2-Step Verification -> App Passwords.`;
          } else {
            emailError = `SMTP: ${errMsg}`;
          }
        }
      }

      // 2. Try Web3Forms if SMTP is not configured or failed
      if (!emailSent) {
        try {
          const web3formsKey = process.env.VITE_WEB3FORMS_KEY || process.env.WEB3FORMS_KEY;
          if (web3formsKey && web3formsKey !== "adminlogin") {
            const web3Res = await fetch("https://api.web3forms.com/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                access_key: web3formsKey,
                subject: emailSubject,
                from_name: "Daily Radiance Advisor",
                name: name,
                email: email,
                to: "lightup365nz@gmail.com",
                message: emailBody,
              }),
            });
            const web3Data = await web3Res.json();
            if (web3Data.success) {
              emailSent = true;
              console.log("[Lead Web3Forms] Email successfully sent via Web3Forms API to lightup365nz@gmail.com");
            } else {
              console.error("[Lead Web3Forms Error]", web3Data);
              emailError = emailError ? `${emailError} | Web3Forms: ${JSON.stringify(web3Data)}` : `Web3Forms: ${JSON.stringify(web3Data)}`;
            }
          }
        } catch (w3Err: any) {
          console.error("[Lead Web3Forms Fetch Error]", w3Err);
          emailError = emailError ? `${emailError} | Web3Forms Fetch: ${w3Err.message}` : `Web3Forms Fetch: ${w3Err.message}`;
        }
      }

      // Fallback: Delivery simulator (logs it)
      if (!emailSent) {
        console.log("=========================================================================");
        console.log(`[Lead Delivery Simulator] WOULD SEND EMAIL TO lightup365nz@gmail.com:`);
        console.log(`Subject: ${emailSubject}`);
        console.log(emailBody);
        console.log("=========================================================================");
      }

      res.json({
        success: true,
        sent: emailSent,
        error: emailSent ? null : (emailError || "Logged to server console (SMTP / Web3Forms keys not set)")
      });
    } catch (err: any) {
      console.error("[Lead Route Error]", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          protocol: 'wss',
          clientPort: 443,
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
