import { connectDeriv, subscribeBalance, ws } from "./api.js";

const token = localStorage.getItem("deriv_token");

if (!token) window.location.href = "index.html";

// UI Elements
const balanceEl = document.getElementById("balance");
const accountEl = document.getElementById("account");
const currencyEl = document.getElementById("currency");
const nameEl = document.getElementById("name");
const logoutBtn = document.getElementById("logoutBtn");
const runBotBtn = document.getElementById("runBotBtn");
const statusEl = document.getElementById("status");

// Connect to Deriv
connectDeriv(token)
  .then((user) => {
    accountEl.textContent = user.loginid;
    currencyEl.textContent = user.currency;
    nameEl.textContent = user.fullname || "Deriv Trader";

    // Subscribe to live balance
    subscribeBalance();
  })
  .catch((err) => {
    alert("Authorization failed: " + err);
    localStorage.removeItem("deriv_token");
    window.location.href = "index.html";
  });

// Listen for balance updates
window.addEventListener("balanceUpdate", (e) => {
  balanceEl.textContent = parseFloat(e.detail).toFixed(2);
});

// Logout button
logoutBtn.onclick = () => {
  localStorage.removeItem("deriv_token");
  window.location.href = "index.html";
};

// ==========================
// UNDER 8 BOT LOGIC
// ==========================
let botRunning = false;

runBotBtn.onclick = () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    alert("WebSocket not connected. Refresh and try again.");
    return;
  }

  botRunning = !botRunning;
  statusEl.textContent = botRunning ? "Bot Running..." : "Idle";
  runBotBtn.textContent = botRunning ? "■ Stop Bot" : "▶ Run Under 8 Bot";

  if (botRunning) startUnder8Bot();
};

// Example Under 8 bot
function startUnder8Bot() {
  if (!botRunning) return;

  // Generate a random "digit" for example purposes
  const randomDigit = Math.floor(Math.random() * 10);

  console.log("Under 8 Bot checking digit:", randomDigit);

  if (randomDigit < 8) {
    // Send a simple trade order (example)
    const tradeMsg = {
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
    ws.send(JSON.stringify(tradeMsg));
    console.log("Trade executed (digit < 8)");
  } else {
    console.log("No trade (digit >= 8)");
  }

  // Repeat every 1 second
  setTimeout(startUnder8Bot, 1000);
}
