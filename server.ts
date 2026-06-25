import express from "express";
import path from "path";
import fs from "fs";
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

async function generateContentWithRetry(
  gemini: GoogleGenAI,
  modelName: string,
  prompt: string,
  config: any,
  maxRetries = 3
): Promise<any> {
  let delay = 500; // start with 500ms delay
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Gemini] Model ${modelName} - Attempt ${i + 1}/${maxRetries}`);
      const response = await gemini.models.generateContent({
        model: modelName,
        contents: prompt,
        config: config,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      console.log(`[Gemini] Info: Model ${modelName} - Attempt ${i + 1} is temporarily busy or rate-limited. Retrying...`);
      const errStr = String(err.message || JSON.stringify(err) || "");
      
      const isOverloaded = 
        errStr.includes("503") || 
        errStr.includes("UNAVAILABLE") || 
        errStr.includes("429") || 
        errStr.includes("RESOURCE_EXHAUSTED") || 
        errStr.includes("high demand");

      const isTransient = 
        isOverloaded ||
        errStr.includes("fetch failed") ||
        errStr.includes("temporary");
        
      if (isOverloaded) {
        // If the model is overloaded or rate limited, immediately fail-fast so the outer loop tries another model
        throw err;
      }
        
      if (!isTransient && i === 0) {
        // If it is a hard client/config/model-name error (e.g. 404), throw immediately to switch models
        throw err;
      }
      
      if (i < maxRetries - 1) {
        console.log(`[Gemini] Waiting ${delay}ms before retrying ${modelName}...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }
}

async function generateContentWithSchemaFallback(
  gemini: GoogleGenAI,
  modelName: string,
  prompt: string,
  systemInstruction: string,
  schema: any,
  maxRetries = 3
): Promise<any> {
  // Try 1: With Structured JSON Schema
  try {
    console.log(`[Gemini] Attempting structured generation with schema for model: ${modelName}`);
    const response = await generateContentWithRetry(
      gemini,
      modelName,
      prompt,
      {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
      maxRetries
    );
    if (response && response.text) {
      return response;
    }
  } catch (err: any) {
    console.log(`[Gemini] Info: Structured generation with schema is temporarily unavailable for ${modelName}.`);
    const errStr = String(err.message || JSON.stringify(err) || "");
    
    // If the error was a 503 or other transient error, we shouldn't attempt the same model again immediately.
    // We should let it bubble up so the next model in the fallback list can be tried.
    const isTransient = 
      errStr.includes("503") || 
      errStr.includes("UNAVAILABLE") || 
      errStr.includes("429") || 
      errStr.includes("RESOURCE_EXHAUSTED") || 
      errStr.includes("high demand") || 
      errStr.includes("fetch failed") ||
      errStr.includes("temporary");

    if (isTransient) {
      throw err;
    }
    
    // Otherwise, try without schema (as plain JSON or plain text)
    console.log(`[Gemini] Retrying model ${modelName} WITHOUT schema parameters...`);
    const plainPrompt = `${prompt}\n\nIMPORTANT: You must return your response as a valid JSON object matching this schema:
{
  "summary": "A highly concise 1-2 sentence quick summary",
  "answer": "The full detailed markdown-formatted answer"
}
Ensure there is no markdown code block formatting (like \`\`\`json) outside the JSON, just return raw JSON text.`;

    try {
      return await generateContentWithRetry(
        gemini,
        modelName,
        plainPrompt,
        {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
        },
        1 // only 1 attempt for the fallback format
      );
    } catch (innerErr: any) {
      console.log(`[Gemini] Info: JSON-only mode unavailable for ${modelName}, trying plain text:`, innerErr.message || "Request paused");
      return await generateContentWithRetry(
        gemini,
        modelName,
        plainPrompt,
        {
          systemInstruction: systemInstruction,
        },
        1
      );
    }
  }
}

function generateLocalFallback(query: string, language: string, knowledgeBase: any[]) {
  const isZh = language === 'zh';
  const normQuery = query.toLowerCase();

  // Find relevant entries
  const kbList = Array.isArray(knowledgeBase) ? knowledgeBase : [];
  const relevantEntries = kbList.filter((k: any) => {
    if (k.lang && k.lang !== language) return false;
    const titleMatch = k.title && k.title.toLowerCase().includes(normQuery);
    const contentMatch = k.content && k.content.toLowerCase().includes(normQuery);
    const tagMatch = k.tags && k.tags.some((t: string) => normQuery.includes(t.toLowerCase()) || t.toLowerCase().includes(normQuery));
    return titleMatch || contentMatch || tagMatch;
  });

  let summary = "";
  let answer = "";

  const disclaimer = isZh 
    ? "\n\n---\n\n*免责声明：LifeWave 贴片是健康保健产品，不用于诊断、治疗、治愈或预防任何疾病。在开始任何光波疗法方案之前，请咨询您的医疗保健专业人员。*"
    : "\n\n---\n\n*Disclaimer: LifeWave patches are wellness products and are not intended to diagnose, treat, cure, or prevent any disease. Always consult your healthcare professional before starting any phototherapy protocol.*";

  if (relevantEntries.length > 0) {
    if (isZh) {
      summary = `已根据您的提问为您找到关于以下产品/科学的说明：${relevantEntries.map(e => e.title).join("、")}。这些产品能通过光疗促进身体自我调节。`;
      
      answer = `### 智能顾问本地检索结果\n\n您好！目前云端智能分析服务正处于高负荷状态，已为您切换至本地知识库检索。以下是为您匹配到的 LifeWave 核心解答：\n\n`;
      relevantEntries.forEach((entry: any) => {
        answer += `#### ${entry.title}\n\n${entry.content}\n\n`;
      });
      answer += `#### 建议与贴敷指引\n\n- **X39 贴片**：可贴在 CV6（肚脐下方两指宽）或 GV14（大颈椎底部）。\n- **Aeon 抗压贴**：建议贴在 GV14 或右侧太冲穴，有助于舒缓压力和减轻发炎。\n- **IceWave 止痛贴**：可贴在疼痛部位（白色贴右侧，棕色贴左侧或痛点中心）。\n\n请多喝水以促进光疗效果。`;
    } else {
      summary = `Based on your query, we retrieved info on ${relevantEntries.map(e => e.title).join(", ")}. These phototherapy patches use light reflection to support biological health.`;
      
      answer = `### Wellness Advisor Local Retrieval\n\nHello! The AI Cloud service is currently experiencing very high demand. I have automatically retrieved the most relevant information from our local LifeWave Knowledge Base for you:\n\n`;
      relevantEntries.forEach((entry: any) => {
        answer += `#### ${entry.title}\n\n${entry.content}\n\n`;
      });
      answer += `#### Recommended Placements & Usage\n\n- **X39 Stem Cell Activation**: Place GV14 (base of the neck) or CV6 (two inches below the belly button) in the morning.\n- **Y-Age Aeon**: Place at GV14 or on the right side of the body. Great for reducing inflammation and stress.\n- **IceWave**: Use the Tan patch on the localized pain point, and the White patch to the right or around the area (Clock/Cross Method).\n\nRemember to stay well hydrated to maximize the phototherapy benefits.`;
    }
  } else {
    // General match-all fallback
    if (isZh) {
      summary = "LifeWave 采用先进的光疗科技，通过贴片反射特定光波来活化干细胞、缓解疼痛与释放压力。";
      answer = `### 智能顾问常见解答\n\n您好！目前服务繁忙，这里是为您准备的 LifeWave 产品快速概览：\n\n` +
        `#### 🌟 核心产品 X39\n` +
        `LifeWave X39 贴片是核心产品，经临床验证能够提升体内的 GHK-Cu 铜肽，从而激活您自身的干细胞。它能带来以下益处：\n` +
        `- 快速缓解痛楚与酸痛\n` +
        `- 减少身体炎症，促进伤口愈合\n` +
        `- 提升能量、精力和睡眠质量\n` +
        `**贴敷位置**：GV14（大椎穴，低头时颈部最突出的骨头处）或 CV6（气海穴，肚脐下方两指宽）。每天早上贴一片，12小时后撕下，多喝水。\n\n` +
        `#### 🛡️ 抗压与发炎 (Aeon)\n` +
        `Y-Age Aeon 贴片专注于舒缓自主神经系统，减轻压力，平衡身体并减少发炎症状，是抗衰老的关键搭配。\n\n` +
        `#### ❄️ 快速止痛 (IceWave)\n` +
        `IceWave 使用一白一棕的双贴疗法。白色贴片贴在痛点右侧或上方，棕色贴片直接贴在最痛的点上，能快速打通微循环以消痛。`;
    } else {
      summary = "LifeWave uses advanced phototherapy patches to reflect specific wavelengths of light, promoting stem cell activation, pain relief, and stress reduction.";
      answer = `### Wellness Advisor General FAQ\n\nHello! Since our cloud model is busy right now, here is a helpful overview of LifeWave's phototherapy technology and most recommended products:\n\n` +
        `#### 🌟 Flagship Product: LifeWave X39\n` +
        `The X39 patch is clinically proven to elevate GHK-Cu copper peptide, activating your body's own stem cells. Key benefits include:\n` +
        `- Fast pain relief and inflammation reduction\n` +
        `- Support for rapid wound healing\n` +
        `- Enhanced energy, vitality, and deep restful sleep\n` +
        `**Placement**: Apply in the morning either at **GV14** (the bump at the base of the neck) or **CV6** (two inches below the navel). Leave on for 12 hours, then remove and discard. Stay hydrated.\n\n` +
        `#### 🛡️ Stress & Inflammation (Aeon)\n` +
        `The Y-Age Aeon patch balances the autonomic nervous system, promoting deep relaxation and cooling down systemic inflammation, which is vital for cellular longevity.\n\n` +
        `#### ❄️ Specialized Pain Relief (IceWave)\n` +
        `IceWave uses a dual-patch configuration (Tan & White). Place the Tan patch directly on the pain center, and the White patch to the right of it or clock-style around it to clear bio-electrical pain pathways.`;
    }
  }

  return {
    summary,
    answer: answer + disclaimer
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/ask", async (req, res) => {
    const { query, language, knowledgeBase } = req.body;
    try {
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      // If GEMINI_API_KEY is not defined, fail-safe immediately to local fallback
      if (!process.env.GEMINI_API_KEY) {
        console.warn("[Gemini] GEMINI_API_KEY not found. Falling back to local intelligence retrieval...");
        const localResponse = generateLocalFallback(query, language, knowledgeBase);
        return res.json(localResponse);
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
        "gemini-flash-latest",
        "gemini-3.1-pro-preview"
      ];

      let response = null;
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          console.log(`[Gemini] Requesting structured generation from model: ${modelName}`);
          response = await generateContentWithSchemaFallback(
            gemini,
            modelName,
            prompt,
            "You are an expert AI advisor for LifeWave products. Provide clear, supportive, and informative answers in JSON format. Always include the standard wellness disclaimer if giving health advice.",
            {
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
            },
            2 // Try up to 2 times with retry per model in the chain
          );
          if (response && response.text) {
            console.log(`[Gemini] Successfully retrieved response using model: ${modelName}`);
            break;
          }
        } catch (err: any) {
          console.log(`[Gemini] Info: Model ${modelName} fallback check completed:`, err.message || "Rate limited");
          lastError = err;
        }
      }

      if (!response || !response.text) {
        console.log("[Gemini] Info: Switching to local intelligence retrieval to guarantee high-quality answer...");
        const localResponse = generateLocalFallback(query, language, knowledgeBase);
        return res.json(localResponse);
      }

      let finalAnswer = "";
      let finalSummary = "";

      const textOutput = response.text.trim();
      try {
        let jsonText = textOutput;
        if (textOutput.includes("```")) {
          const match = textOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
          if (match && match[1]) {
            jsonText = match[1].trim();
          }
        }

        if (jsonText.startsWith("{")) {
          const parsed = JSON.parse(jsonText);
          finalAnswer = parsed.answer || "";
          finalSummary = parsed.summary || "";
        } else {
          finalAnswer = textOutput;
          finalSummary = textOutput.split("\n")[0] || "LifeWave phototherapy recommendations.";
        }
      } catch (jsonErr) {
        console.log("[Gemini] Info: Parsing raw text response...");
        finalAnswer = textOutput;
        finalSummary = textOutput.substring(0, 150) + "...";
      }

      res.json({ answer: finalAnswer, summary: finalSummary });
    } catch (error: any) {
      console.log("[Gemini] Info: Internal exception, returning local response...");
      try {
        const localResponse = generateLocalFallback(query, language, knowledgeBase);
        res.json(localResponse);
      } catch (fallbackErr: any) {
        res.status(500).json({ error: "Service status updated." });
      }
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


  // Serve static assets or fallback to Vite dev server
  const distPath = path.join(process.cwd(), 'dist');
  const hasBuiltApp = fs.existsSync(path.join(distPath, "index.html"));

  if (process.env.NODE_ENV !== "production" || !hasBuiltApp) {
    console.log("[Server] Starting in DEVELOPMENT mode using Vite dev server...");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log(`[Server] Starting in PRODUCTION mode, serving static files from: ${distPath}`);
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
