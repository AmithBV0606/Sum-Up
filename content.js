// To extract the articles from the web pages

function getArticleText() {
  // If you inspect any articles website, you'll notice that all the articles will be wrapped with in the "<article>" tag.
  const article = document.querySelector("article");

  if (article) return article.innerText;

  const paragraphs = Array.from(document.querySelectorAll("p"));

  return paragraphs.map((p) => p.innerText).join("\n");
}

// Listens for some commands from popup.js
chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if ((req.type = "GET_ARTICLE_TEXT")) {
    const text = getArticleText();
    sendResponse({ text });
  }
});  