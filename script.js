const API_KEY = "AIzaSyCPtwqRY23TExC6s_v7i04cE0x7TBouUaE"; // 🔑 Replace with your actual key

const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-button");

async function sendMessage() {
  const input = userInput.value.trim();
  if (!input) return;

  appendMessage(input, "user");
  userInput.value = "";

  const loadingMsg = appendMessage("✨ Reading your stars...", "bot");

  try {
    const system = /india|delhi|mumbai|kolkata|chennai|hyderabad|vedic/i.test(input)
      ? "Vedic (Indian)"
      : "Western";

    const prompt = `
You are Sage Mira, a wise, poetic AI astrologer. Respond using deep and region-specific astrology (use ${system} system) with elegant, mystical tone.
User asked: "${input}"
    `.trim();

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await res.json();
    console.log("Gemini Response:", data);

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Gemini returned no readable response.");

    showTypingEffect(text, loadingMsg.querySelector(".message__text"));

  } catch (err) {
    loadingMsg.querySelector(".message__text").innerText = "⚠️ " + err.message;
    console.error("Error:", err);
  }
}

function appendMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message message--${sender}`;
  msg.innerHTML = `<div class="message__text">${text}</div>`;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return msg;
}

function showTypingEffect(text, el, delay = 25) {
  let i = 0;
  el.innerText = "";
  const interval = setInterval(() => {
    el.innerText += text[i++];
    if (i >= text.length) clearInterval(interval);
  }, delay);
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
