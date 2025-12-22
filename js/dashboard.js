// ===============================
// Dashboard Logic – Minimal
// ===============================

// Get token from localStorage
const token = localStorage.getItem("deriv_token");
if (!token) window.location.href = "index.html";

// UI elements
const balanceEl = document.getElementById("balance");
const accountEl = document.getElementById("account");
const currencyEl = document.getElementById("currency");
const nameEl = document.getElementById("name");

// Connect to Deriv and load account info
connectDeriv(token)
  .then((user) => {
    // Display account info
    if (accountEl) accountEl.textContent = user.loginid;
    if (currencyEl) currencyEl.textContent = user.currency;
    if (nameEl) nameEl.textContent = user.fullname || "Deriv Trader";

    // Subscribe to balance updates
    subscribeBalance();
  })
  .catch((err) => {
    alert("Authorization failed: " + err);
    localStorage.removeItem("deriv_token");
    window.location.href = "index.html";
  });

// Listen for balance updates
ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  if (data.msg_type === "balance" && data.balance) {
    if (balanceEl) balanceEl.textContent = parseFloat(data.balance.balance).toFixed(2);
  }
};
