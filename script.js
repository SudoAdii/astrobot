const API_KEY = "AIzaSyCPtwqRY23TExC6s_v7i04cE0x7TBouUaE"; // 🔑 Replace with your actual Gemini API Key
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;

const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-button");

let isGeneratingResponse = false;

// Utility: create chat bubble
function createMessageElement(message, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `message--${sender}`);
    messageElement.innerHTML = `<div class="message__text">${message}</div>`;
    return messageElement;
}

// Utility: typing effect
function showTypingEffect(fullText, element, delay = 20) {
    let index = 0;
    element.innerText = "";
    const interval = setInterval(() => {
        if (index < fullText.length) {
            element.innerText += fullText[index++];
        } else {
            clearInterval(interval);
        }
    }, delay);
}

// Send message
async function sendMessage() {
    const input = userInput.value.trim();
    if (!input || isGeneratingResponse) return;

    // Display user message
    const userMessage = createMessageElement(input, "user");
    chatContainer.appendChild(userMessage);
    userInput.value = "";

    // Bot placeholder
    const botMessage = createMessageElement("✨ Reading your stars...", "bot");
    chatContainer.appendChild(botMessage);

    // Scroll
    chatContainer.scrollTop = chatContainer.scrollHeight;

    isGeneratingResponse = true;

    try {
        const isIndian = /india|delhi|mumbai|kolkata|chennai|bangalore|hyderabad|jaipur|surat|pune|indore/i.test(input);
        const system = isIndian ? "Vedic (Indian)" : "Western";

        const prompt = `
You are Sage Mira, an astrologer of great renown, who gives spiritually profound, poetic, and region-accurate astrological readings. 
Use the ${system} astrology system based on the user's input.

User query: "${input}"

Craft a mystical birth chart interpretation or astrological insight based on the system. Keep your tone elegant, magical, yet warm.
        `.trim();

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    }
                ]
            })
        });

        const data = await res.json();
        console.log("Gemini API response:", data);

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Gemini returned no astrological response.");
        }

        const botTextElement = botMessage.querySelector(".message__text");
        showTypingEffect(text, botTextElement, 25);

    } catch (err) {
        console.error("Error:", err.message);
        const botTextElement = botMessage.querySelector(".message__text");
        botTextElement.innerText = `⚠️ ${err.message || "Something went wrong with the stars."}`;
    }

    isGeneratingResponse = false;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Events
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});
