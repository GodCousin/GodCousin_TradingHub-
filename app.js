const APP_ID = 112117; // Your Deriv App ID

let ws = null;

/* =========================
   LOGIN (LANDING PAGE)
========================= */
function loginDeriv() {
  const redirectUrl = window.location.origin + "/index.html";

  const authUrl =
    `https://oauth.deriv.com/oauth2/authorize` +
    `?app_id=${APP_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUrl)}`;

  window.location.href = authUrl;
}

/* =========================
   TOKEN EXTRACTION
========================= */
function extractToken() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token"); // ✅ FIXED
}

const tokenFromUrl = extractToken();

if (tokenFromUrl) {
  localStorage.setItem("deriv_token", tokenFromUrl);

  // Clean URL
  window.history.replaceState({}, document.title, "/dashboard.html");

  window.location.href = "dashboard.html";
}

/* =========================
   DASHBOARD LOGIC
========================= */
if (window.location.pathname.toLowerCase().includes("dashboard")) {
  const token = localStorage.getItem("deriv_token");

  if (!token) {
    alert("Please connect to Deriv first.");
    window.location.href = "index.html";
  } else {
    ws = new WebSocket(
      `wss://ws.deriv.com/websockets/v3?app_id=${APP_ID}`
    );

    ws.onopen = () => {
      console.log("Connected to Deriv WebSocket");
      ws.send(JSON.stringify({ authorize: token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        alert("Error: " + data.error.message);
        if (data.error.code === "InvalidToken") logout();
        return;
      }

      if (data.msg_type === "authorize") {
        ws.send(JSON.stringify({ balance: 1, subscribe: 1 }));
      }

      if (data.msg_type === "balance") {
        const balanceEl = document.getElementById("balance");
        if (balanceEl) {
          balanceEl.innerText =
            data.balance.balance.toFixed(2) +
            " " +
            data.balance.currency;
        }
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.log("Disconnected from Deriv");
  }
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.removeItem("deriv_token");
  if (ws) ws.close();
  window.location.href = "index.html";
}
