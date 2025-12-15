const APP_ID = "112117";
const BASE_URL = "https://godcousintradinghub.vercel.app";
const REDIRECT_URI = `${BASE_URL}/dashboard.html`;

// LOGIN
function loginDeriv() {
  const authUrl =
    `https://oauth.deriv.com/oauth2/authorize` +
    `?app_id=${APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  window.location.href = authUrl;
}

// TOKEN
function extractToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

const tokenFromUrl = extractToken();
if (tokenFromUrl) {
  localStorage.setItem("deriv_token", tokenFromUrl);
  window.location.replace("/dashboard.html");
}

// DASHBOARD
if (window.location.pathname.includes("dashboard")) {
  const token = localStorage.getItem("deriv_token");

  if (!token) {
    window.location.replace("/");
  } else {
    const ws = new WebSocket(
      `wss://ws.deriv.com/websockets/v3?app_id=${APP_ID}`
    );

    ws.onopen = () => {
      ws.send(JSON.stringify({ authorize: token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.msg_type === "authorize") {
        ws.send(JSON.stringify({ balance: 1 }));
      }

      if (data.msg_type === "balance") {
        document.getElementById("balance").innerText =
          `${data.balance.balance} ${data.balance.currency}`;
      }

      if (data.error) {
        alert(data.error.message);
        logout();
      }
    };
  }
}

// LOGOUT
function logout() {
  localStorage.removeItem("deriv_token");
  window.location.replace("/");
}
