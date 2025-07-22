const API_KEY = "AIzaSyCPtwqRY23TExC6s_v7i04cE0x7TBouUaE"; // Replace this

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

// Sending messages
sendButton.onclick = sendMessage;
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  addMessage("You", text, "user");
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
  const responseEl = addMessage("Sage Mira", "🔮 Asking the stars...", "bot");

  if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY") {
    responseEl.innerHTML = "❌ API key missing! Please replace it in script.js.";
    return;
  }

  const isIndian = /india|vedic/i.test(userInput);
  const systemPrompt = isIndian
    ? "Use Indian Vedic astrology with Rashis, Nakshatras and spiritual tone."
    : "Use Western astrology with planetary alignments and houses.";

const prompt = `
You are a friendly, wise, and modern astrologer named Mira.

Answer in simple, clear language — like you're speaking to a friend.
Use bullet points, emojis, and keep answers short and focused.

If the user mentions India or an Indian location, use Vedic astrology style.
Otherwise, use Western astrology.

Speak directly to the user and include:
- Their zodiac sign
- 1 short sentence on love
- 1 short sentence on career or money
- 1 lucky tip or warning

Here is the user's question or birth info:
"${userInput}"
`;


  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await res.json();

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.toString() ||
      data?.candidates?.[0]?.content?.text;

    if (!output) {
      console.warn("Raw Gemini response:", data);
      responseEl.innerHTML = "⚠️ Gemini responded, but no prediction text was found.";
      return;
    }

    showTypingEffect(formatResponse(output), responseEl);
  } catch (err) {
    console.error("Gemini error:", err);
    responseEl.innerHTML = "⚠️ Failed to reach Gemini. Check your API key and connection.";
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
