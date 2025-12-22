// ===============================
// GOTH – Deriv OAuth Controller
// ===============================

// Your Deriv App ID
const APP_ID = 112117;

// Your live domain (must match Deriv dashboard)
const REDIRECT_URL = "https://god-cousin-trading-hub.vercel.app";

// ===============================
// 1️⃣ CONNECT TO DERIV
// ===============================
function connectToDeriv() {
  const oauthUrl =
    "https://oauth.deriv.com/oauth2/authorize" +
    "?app_id=" + APP_ID +
    "&redirect_uri=" + encodeURIComponent(REDIRECT_URL);

  window.location.href = oauthUrl;
}

// ===============================
// 2️⃣ HANDLE REDIRECT FROM DERIV
// ===============================
(function handleDerivRedirect() {
  const params = new URLSearchParams(window.location.search);

  // Deriv may return token or access_token
  const token =
    params.get("token") ||
    params.get("access_token");

  if (token) {
    // Save token securely
    localStorage.setItem("deriv_token", token);

    // Clean URL (remove token from address bar)
    window.history.replaceState({}, document.title, "/");

    // Go to dashboard
    window.location.href = "dashboard.html";
  }
})();
