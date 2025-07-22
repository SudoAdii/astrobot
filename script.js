const API_KEY = "AIzaSyCPtwqRY23TExC6s_v7i04cE0x7TBouUaE"; // <-- Replace this with your Gemini API key

const chatbox = document.getElementById("chatbox");
const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const themeToggle = document.getElementById("theme-toggle");

// Theme setup
document.body.classList.toggle("dark", localStorage.getItem("theme") === "dark");
themeToggle.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";
themeToggle.onclick = () => {
  const dark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", dark ? "dark" : "light");
  themeToggle.textContent = dark ? "🌞" : "🌙";
};

// Message sending
sendButton.onclick = sendMessage;
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  const msgText = addMessage("You", text, "user");
  input.value = "";
  getAstrologyResponse(text);
}

function addMessage(sender, text, role = "user") {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.innerHTML = `<strong>${sender}:</strong><div class="msg-text">${text}</div>`;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
  return msg.querySelector(".msg-text");
}

async function getAstrologyResponse(userInput) {
  const responseEl = addMessage("Sage Mira", "✨ Consulting the stars...", "bot");

  const isIndian = userInput.toLowerCase().includes("india") || userInput.toLowerCase().includes("vedic");
  const systemPrompt = isIndian
    ? "Use Indian Vedic astrology. Use Nakshatras, Rashis, and a poetic tone."
    : "Use Western astrology style with houses, signs, and planets.";

  const prompt = `
You are Sage Mira, a wise mystical AI astrologer.
Give poetic, deep insights based on the user's birth data or question.

Style: Use ${isIndian ? "Indian Vedic" : "Western"} astrology.
Format output with:
- **bold titles**
- 🔹 bullet points
- ✨ spiritual tone
- <br> for line breaks
---

User's message: "${userInput}"
`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await res.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!output) {
      responseEl.innerHTML = "⚠️ Gemini returned no prediction.";
      return;
    }

    showTypingEffect(formatResponse(output), responseEl);
  } catch (err) {
    console.error("Gemini error:", err);
    responseEl.innerHTML = "⚠️ The stars failed to respond.";
  }
}

function showTypingEffect(text, el, delay = 15) {
  el.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    el.innerHTML = text.slice(0, i++) + "_";
    if (i >= text.length) {
      el.innerHTML = text;
      clearInterval(interval);
    }
  }, delay);
}

function formatResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n- /g, "<br>🔹 ")
    .replace(/\n/g, "<br>")
    .replace(/(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)/gi, "<span style='color:#ffcc00'>$1</span>")
    .replace(/(Rashi|Nakshatra|Lagna|Ketu|Rahu|Shani|Surya|Chandra)/gi, "<em>$1</em>");
}
