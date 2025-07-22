const apiKey = "YOUR_GEMINI_API_KEY"; // 🔒 Replace this with your real API key

async function getAstroReading() {
  const inputEl = document.getElementById("userInput");
  const chatbox = document.getElementById("chatbox");
  const input = inputEl.value.trim();

  if (!input) return;

  chatbox.innerHTML += `<p><strong>You:</strong> ${input}</p>`;

  // Detect region for astrology system
  const isIndian = /india|delhi|mumbai|kolkata|chennai|bangalore|hyderabad|jaipur|surat|pune|indore/i.test(input);
  const system = isIndian ? "Vedic (Indian)" : "Western";

  const prompt = `
You are Sage Mira, a wise and poetic astrologer with deep mastery in ${system} astrology.

Analyze the following birth details and provide a detailed, emotional, and spiritually insightful reading:
"${input}"

Speak like a real astrologer. Never ask questions. Your tone should be mystical, warm, and poetic. Reflect past-life themes if using Vedic astrology.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();
  const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from the stars.";

  chatbox.innerHTML += `<p><strong>Sage Mira:</strong> ${output}</p>`;
  chatbox.scrollTop = chatbox.scrollHeight;
  inputEl.value = "";
}
