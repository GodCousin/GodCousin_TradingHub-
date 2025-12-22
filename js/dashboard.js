// ===============================
// Dashboard Logic
// ===============================

const token = localStorage.getItem("deriv_token");

if (!token) {
  window.location.href = "index.html";
}

// UI elements
const balanceEl = document.getElementById("balance");
const currencyEl = document.getElementById("currency");
const accountEl = document.getElementById("account");
const nameEl = document.getElementById("name");

// Connect + Load Info
connectDeriv(token)
  .then((user) => {
    // Account info
    accountEl.textContent = user.loginid;
    currencyEl.textContent = user.currency;
    nameEl.textContent = user.fullname || "Deriv Trader";

    // Subscribe balance
    subscribeBalance();
  })
  .catch((err) => {
    alert("Authorization failed: " + err);
    localStorage.removeItem("deriv_token");
    window.location.href = "index.html";
  });

// Listen for balance updates
(function listenBalance() {
  if (!window.ws) return;

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);

    if (data.msg_type === "balance") {
      balanceEl.textContent =
        data.balance.balance.toFixed(2);
    }
  };
})();
