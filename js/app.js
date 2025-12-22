// js/app.js
const APP_ID = "112117";
const REDIRECT_URL = "https://god-cousin-trading-hub.vercel.app/dashboard.html";

function connectDeriv() {
  const oauthUrl =
    "https://oauth.deriv.com/oauth2/authorize" +
    "?app_id=" + APP_ID +
    "&redirect_uri=" + encodeURIComponent(REDIRECT_URL);

  window.location.href = oauthUrl;
}

// Auto-attach to button
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connectDeriv");
  if (btn) {
    btn.addEventListener("click", connectDeriv);
  }
});
