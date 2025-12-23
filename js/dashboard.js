// ===============================
// WebSocket Connection – DEBUG SAFE
// ===============================

const APP_ID = 112117;
const token = localStorage.getItem("deriv_token");

if (!token) {
  window.location.href = "index.html";
}

const ws = new WebSocket(
  `wss://ws.deriv.com/websockets/v3?app_id=${APP_ID}`
);

ws.onopen = () => {
  console.log("✅ WebSocket connected");
  ws.send(JSON.stringify({ authorize: token }));
};

ws.onerror = (err) => {
  console.error("❌ WebSocket error", err);
};

ws.onclose = () => {
  console.warn("⚠️ WebSocket closed");
};

ws.onmessage = (msg) => {
  console.log("📩 Message:", msg.data);
  const data = JSON.parse(msg.data);

  if (data.error) {
    console.error("❌ Deriv API Error:", data.error.message);
    return;
  }

  if (data.msg_type === "authorize") {
    console.log("✅ Authorized");

    // Account info
    document.getElementById("account").textContent =
      data.authorize.loginid;

    document.getElementById("currency").textContent =
      data.authorize.currency;

    document.getElementById("name").textContent =
      data.authorize.fullname || "Deriv Trader";

    // Subscribe balance
    ws.send(JSON.stringify({ balance: 1, subscribe: 1 }));
  }

  if (data.msg_type === "balance") {
    document.getElementById("balance").textContent =
      parseFloat(data.balance.balance).toFixed(2);
  }
};
