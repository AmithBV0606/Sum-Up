document.addEventListener("DOMContentLoaded", () => {
  // As soon as the DOM content of options.html page gets loaded, a call-back function is called, which gets the Gemini API key from the storage and populates the API key into the input.
  chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
    if (geminiApiKey) document.getElementById("api-key").value = geminiApiKey;
  });

  //   As we click on "Save Settings" button
  document.getElementById("save-button").addEventListener("click", () => {
    const apiKey = document.getElementById("api-key").value.trim();
    if (!apiKey) return;

    chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
      document.getElementById("success-message").style.display = "block";
      setTimeout(() => window.close(), 2000);
    });
  });
});