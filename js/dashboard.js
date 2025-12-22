// ===============================
// Dashboard Logic – GOTH Trading Hub
// ===============================

const token = localStorage.getItem("deriv_token");
if (!token) window.location.href = "index.html";

// UI elements
const balanceEl = document.getElementById("balance");
const accountEl = document.getElementById("account");
const currencyEl = document.getElementById("currency");
const nameEl = document.getElementById("name");
const logoutBtn = document.getElementById("logoutBtn");
const runBtn = document.querySelector(".run-btn");
const runStatus = document.querySelector(".run-bar p");

// WebSocket connection
const APP_ID = 112117;
const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);

// ===============================
// WebSocket Events
// ===============================
ws.onopen = () => {
  ws.send(JSON.stringify({ authorize: token }));
};

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  // Authorize success
  if (data.msg_type === "authorize") {
    if (accountEl) accountEl.textContent = data.authorize.loginid;
    if (currencyEl) currencyEl.textContent = data.authorize.currency;
    if (nameEl) nameEl.textContent = data.authorize.fullname || "Deriv Trader";

    // Subscribe to balance updates
    ws.send(JSON.stringify({ balance: 1, subscribe: 1 }));
  }

  // Update live balance
  if (data.msg_type === "balance" && data.balance) {
    if (balanceEl) balanceEl.textContent = parseFloat(data.balance.balance).toFixed(2);
  }

  // Listen for bot/trade status messages (future extension)
  if (data.msg_type === "bot_status" && runStatus) {
    runStatus.textContent = data.status;
  }

  // Handle API errors
  if (data.error) {
    console.error("Deriv API Error:", data.error.message);
  }
};

// ===============================
// Logout Button
// ===============================
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("deriv_token");
    window.location.href = "/";
  });
}

// ===============================
// Run Bot Button
// ===============================
if (runBtn) {
  runBtn.addEventListener("click", () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("WebSocket not connected. Try refreshing.");
      return;
    }

    runStatus.textContent = "Running bot...";

    // Example: trigger a sample trade via WebSocket (replace with your strategy)
    const tradeMessage = {
      buy: 1,
      price: 1,
      parameters: {
        symbol: "R_100",
        amount: 1,
        basis: "stake",
        contract_type: "CALL",
        duration: 1,
        duration_unit: "t"
      }
    };

    ws.send(JSON.stringify(tradeMessage));

    // Update status after sending (placeholder)
    setTimeout(() => {
      runStatus.textContent = "Bot ran successfully (example)";
    }, 1000);
  });
});
