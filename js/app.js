const APP_ID = "112117";
const REDIRECT_URL = "https://god-cousin-trading-hub.vercel.app/dashboard.html";

window.location.href =
  `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}&redirect_uri=${REDIRECT_URL}`;
