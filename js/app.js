const APP_ID = "112117";

function loginDeriv() {
  const redirect = "https://god-cousin-trading-hub.vercel.app/dashboard.html";
  const url = `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}&redirect_uri=${redirect}`;
  window.location.href = url;
}
