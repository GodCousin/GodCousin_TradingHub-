const APP_ID = "112117"; // Your real app_id

function loginDeriv() {
  const authUrl = `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}`;
  window.location.href = authUrl;
}

function extractToken() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token1");
}

const tokenFromUrl = extractToken();
if (tokenFromUrl) {
  localStorage.setItem("deriv_token", tokenFromUrl);
  window.history.replaceState({}, document.title, "/");
  window.location.href = "Dashboard.html";
}
