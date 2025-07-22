const API_KEY = "AIzaSyCPtwqRY23TExC6s_v7i04cE0x7TBouUaE"; // 🔑 Replace with your actual Gemini API Key

const chatbox = document.getElementById("chatbox");
const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const themeToggle = document.getElementById("theme-toggle");

// Load theme
document.body.classList.toggle("dark", localStorage.getItem("theme") === "dark");
themeToggle.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";

// Toggle theme
themeToggle.onclick = () => {
  const dark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", dark ? "dark" : "light");
  themeToggle.textContent = dark ? "🌞" : "🌙";
};

// Send message
sendButton.onclick = sendMessage;
input.addEventListener("keydown", e => {
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
  const responseElement = addMessage("Sage Mira", "✨ The stars are aligning...", "bot");

  const systemPrompt = userInput.toLowerCase().includes("india") || userInput.toLowerCase().includes("vedic")
    ? "Use Indian Vedic astrology with nakshatras, rashis, and planetary influences. Give poetic, spiritual tone responses."
    : "Use Western astrology with signs, planets, and houses. Give structured, insightful guidance.";

  const prompt = `
You are Sage Mira, a mystical astrologer who gives beautiful, wise and poetic responses.
Structure responses with **bold**, bullet points (using -), and line breaks.

Question:
"${userInput}"

Instructions:
- If location is India or user asks for Vedic, use Indian astrology style.
- Otherwise, use Western astrology.
- Be brief, insightful, and avoid generic info.
`;

  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ]
      })
    });

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      responseElement.innerText = "⚠️ Gemini returned no prediction.";
      console.error("Gemini response error:", data);
      return;
    }

    showTypingEffect(text, responseElement);
  } catch (error) {
    console.error("Gemini API failed:", error);
    responseElement.innerText = "⚠️ The stars failed to speak due to an error.";
  }
}

function showTypingEffect(text, el, delay = 15) {
  const formatted = formatResponse(text);
  el.innerHTML = "";
  let i = 0;

  const interval = setInterval(() => {
    el.innerHTML = formatted.slice(0, i++) + "_";
    if (i >= formatted.length) {
      el.innerHTML = formatted;
      clearInterval(interval);
    }
  }, delay);
}

function formatResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")            // bold
    .replace(/\n- /g, "<br>🔹 ")                                 // bullet points
    .replace(/\n/g, "<br>")                                      // line breaks
    .replace(/(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)/gi, "<span style='color:#ffcc00'>$1</span>") // highlight signs
    .replace(/(Rashi|Nakshatra|Ascendant|Lagna|Ketu|Rahu|Shani|Chandra|Surya|Budh|Shukra|Mangala)/gi, "<em>$1</em>"); // emphasize Vedic terms
}
