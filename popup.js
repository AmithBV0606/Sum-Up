// Test code
// document.getElementById("summarize").addEventListener("click", () => {
//   console.log("Summarize clicked");
// });

document.getElementById("summarize").addEventListener("click", () => {
  const summaryType = document.getElementById("summary-type").value;
  const result = document.getElementById("result");

  result.innerHTML = '<div class="loading"><div class="loader"></div></div>';

  // 1️⃣ Get the user's API Key from the storage
  chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
    if (!geminiApiKey) {
      result.textContent = "No API Key set. Click on gear icon to add one.";
      return;
    }

    // 2️⃣ Ask content.js for the page text
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "GET_ARTICLE_TEXT" },
        async ({ text }) => {
          if (!text) {
            result.textContent = "Couldn't extract text from this page.";
            return;
          }

          // 3️⃣ Send text to Gemini
          try {
            const summary = await getGeminiSummary(
              text,
              summaryType,
              geminiApiKey
            );
            result.textContent = summary;
          } catch (error) {
            result.textContent = "Gemini error : " + error.message;
          }
        }
      );
    });
  });
});

async function getGeminiSummary(rawText, type, apiKey) {
  // Limiting the atricle length to 20,000 characters :
  const max = 20000;
  const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;

  const promptMap = {
    brief: `Summarize in 2-3 sentences:\n\n${text}`,
    detailed: `Give a detailed summary:\n\n${text}`,
    bullets: `Summarize in 5-7 bullet points (start each line with "- "):\n\n${text}`,
  };

  const prompt = promptMap[type] || promptMap.brief;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 },
        }),
      }
    );

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error?.message || "Request failed!");
    }

    // If the the Gemini gives response
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No summary";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
}

// To Copy the text
document.getElementById("copy-btn").addEventListener("click", () => {
  const txt = document.getElementById("result").innerText;
  if (!txt) return;

  navigator.clipboard.writeText(txt).then(() => {
    const btn = document.getElementById("copy-btn");
    const old = btn.textContent;
    btn.textContent = "Copied";
    setTimeout(() => (btn.textContent = old), 2000);
  });
});