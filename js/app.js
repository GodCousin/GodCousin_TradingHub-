// ===== CONFIG =====
const APP_ID = "112117";
const REDIRECT_URL = "https://god-cousin-trading-hub.vercel.app/dashboard.html";

// ===== LOGIN =====
function connectToDeriv() {
  const authUrl =
    `https://oauth.deriv.com/oauth2/authorize` +
    `?app_id=${APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URL)}`;

  window.location.href = authUrl;
}

// ===== HANDLE RETURN FROM DERIV =====
(function handleOAuthReturn() {
  const params = new URLSearchParams(window.location.search);

  // Deriv sends token as "token1"
  const token = params.get("token1");

  if (token) {
    localStorage.setItem("deriv_token", token);

    // Clean URL and move to dashboard
    window.location.replace("/dashboard.html");
  }
})();
