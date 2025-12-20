const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (token) {
  connect(token);
} else {
  console.log("No token found, redirecting to login...");
  // Optionally redirect to login page:
  // window.location.href = "index.html";
}

// Example bot logic
function startBot() {
  document.getElementById("status").innerText = "Bot running";

  if (!ws) {
    console.log("WebSocket not connected");
    return;
  }

  ws.send(JSON.stringify({
    buy: 1,
    price: 1,
    parameters: {
      amount: 1,
      basis: "stake",
      contract_type: "DIGITUNDER",
      currency: "USD",
      duration: 1,
      duration_unit: "t",
      symbol: "R_100",
      barrier: 8
    }
  }));

  console.log("Bot trade sent");
}
