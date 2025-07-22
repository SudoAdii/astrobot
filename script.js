const API_KEY = "AIzaSyCPtwqRY23TExC6s_v7i04cE0x7TBouUaE"; // Replace this with your Gemini API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

const chatbox = document.getElementById("chatbox");
const inputForm = document.getElementById("inputForm");
const userInput = document.getElementById("userInput");
const toggleTheme = document.getElementById("toggleTheme");

let currentUserMessage = "";

// Theme toggling
toggleTheme.onclick = () => {
  document.body.classList.toggle("light");
};

// Handle form submit
inputForm.onsubmit = async (e) => {
  e.preventDefault();
  currentUserMessage = userInput.value.trim();
  if (!currentUserMessage) return;

  addMessage("you", `<strong>You:</strong> ${currentUserMessage}`);
  userInput.value = "";

  const botMsgEl = addMessage("bot", "<em class='typing'>Sage Mira is aligning the stars...</em>");
  await requestAstrologyResponse(botMsgEl);
};

// Add message to chat
function addMessage(role, html) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.innerHTML = html;
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
  return div;
}

// Generate prompt and send to Gemini
async function requestAstrologyResponse(botMessageElement) {
  const textElement = botMessageElement.querySelector(".typing") || botMessageElement;

  const isIndian = /india|mumbai|delhi|kolkata|chennai|hyderabad|lucknow|kanpur/i.test(currentUserMessage);
  const system = isIndian ? "Vedic (Indian)" : "Western";

  const prompt = `
You are Sage Mira, an expert in ${system} astrology.
Given the user input:
"${currentUserMessage}"

Provide a spiritual, poetic astrological reading.
If using Vedic, reflect on karma or past lives.
Avoid robotic tone and questions.
  `;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }),
    });

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "✨ The stars are silent.";

    typeResponse(text, botMessageElement);
  } catch (err) {
    textElement.innerText = "⚠️ An error occurred.";
  }
}

// Typing effect
function typeResponse(text, element, i = 0) {
  element.innerHTML = "";
  const interval = setInterval(() => {
    element.innerHTML += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 15);
}
