// Vercel serverless function. The browser sends a prompt here and this function
// asks Claude, so the API key never reaches the browser.
// Set ANTHROPIC_API_KEY in Vercel: Project > Settings > Environment Variables.
const MAX_PROMPT_CHARS = 6000;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST" });
  }

  const body = typeof req.body === "object" && req.body ? req.body : {};
  const requestKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  const headerKey = typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"].trim() : "";
  const key = requestKey || headerKey || process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: "AI is not configured" });

  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  if (!prompt || prompt.length > MAX_PROMPT_CHARS) {
    return res.status(400).json({ error: "Prompt missing or too long" });
  }

  const headers = {
    "content-type": "application/json",
    "x-api-key": key,
    "anthropic-version": "2023-06-01",
  };
  // Only needed when the key is not scoped to one workspace.
  if (process.env.ANTHROPIC_WORKSPACE_ID) {
    headers["anthropic-workspace-id"] = process.env.ANTHROPIC_WORKSPACE_ID;
  }

  try {
    const reply = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (reply.status === 429) return res.status(429).json({ error: "Busy, try again" });
    if (!reply.ok) {
      console.error("Claude API error", reply.status, await reply.text());
      return res.status(502).json({ error: "AI request failed" });
    }
    const data = await reply.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    return res.status(200).json({ text });
  } catch (error) {
    console.error(error);
    return res.status(502).json({ error: "AI request failed" });
  }
};
