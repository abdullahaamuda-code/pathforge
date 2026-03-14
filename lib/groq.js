import Groq from "groq-sdk";

// Key pools — add your keys here
const ROADMAP_KEYS = [
  process.env.GROQ_API_KEY_ROADMAP_1,
  process.env.GROQ_API_KEY_ROADMAP_2,
].filter(Boolean);

const SCORING_KEYS = [
  process.env.GROQ_API_KEY_SCORING_1,
  process.env.GROQ_API_KEY_SCORING_2,
  process.env.GROQ_API_KEY_SCORING_3,
  process.env.GROQ_API_KEY_SCORING_4,
].filter(Boolean);

const MENTOR_KEYS = [
  process.env.GROQ_API_KEY_MENTOR_1,
  process.env.GROQ_API_KEY_MENTOR_2,
].filter(Boolean);

const ADMIN_KEYS = [
  process.env.GROQ_API_KEY_ADMIN_1,
  process.env.GROQ_API_KEY_ADMIN_2,
].filter(Boolean);

// Round-robin counters
const counters = {
  roadmap: 0,
  scoring: 0,
  mentor: 0,
  admin: 0,
};

// Get next key from pool
function getKey(pool, counterKey) {
  if (!pool.length) {
    // Fallback to main key if pool is empty
    return process.env.GROQ_API_KEY;
  }
  const key = pool[counters[counterKey] % pool.length];
  counters[counterKey]++;
  return key;
}

// Create a Groq client with the next key from pool
function getClient(pool, counterKey) {
  const apiKey = getKey(pool, counterKey);
  return new Groq({ apiKey });
}

// Generic call — returns text
export async function callGroq(systemPrompt, userMessage, options = {}) {
  const pool = options.pool === "mentor" ? MENTOR_KEYS
    : options.pool === "scoring" ? SCORING_KEYS
    : options.pool === "admin" ? ADMIN_KEYS
    : ROADMAP_KEYS;

  const counterKey = options.pool || "roadmap";
  const groq = getClient(pool, counterKey);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1500,
  });

  return response.choices[0]?.message?.content || "";
}

// JSON call — returns parsed object
export async function callGroqJSON(systemPrompt, userMessage, options = {}) {
  const pool = options.pool === "mentor" ? MENTOR_KEYS
    : options.pool === "scoring" ? SCORING_KEYS
    : options.pool === "admin" ? ADMIN_KEYS
    : ROADMAP_KEYS;

  const counterKey = options.pool || "roadmap";
  const groq = getClient(pool, counterKey);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: options.temperature ?? 0.5,
    max_tokens: options.maxTokens ?? 2000,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Conversation call — accepts full messages array (for mentor chat)
export async function callGroqConversation(messages, options = {}) {
  const groq = getClient(MENTOR_KEYS, "mentor");

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1000,
  });

  return response.choices[0]?.message?.content || "";
}