// ====================== CONFIG ======================
const APP_ID = "112117";  // Your app_id
let ws = null;
let chart = null;
let currentProposalId = null;

// ====================== LOGIN & TOKEN ======================
function loginDeriv() {
  const authUrl = `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}&l=en`;
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
  if (!window.location.pathname.toLowerCase().includes("dashboard")) {
    window.location.href = "Dashboard.html";
  }
}

// ====================== DASHBOARD LOGIC ======================
if (window.location.pathname.toLowerCase().includes("dashboard")) {
  const token = localStorage.getItem("deriv_token");

  if (!token) {
    alert("Please connect to Deriv first.");
    window.location.href = "index.html";
  } else {
    connectWebSocket(token);
  }
}

// ====================== WEBSOCKET CONNECTION ======================
function connectWebSocket(token) {
  ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);

  ws.onopen = () => {
    console.log("WebSocket connected");
    ws.send(JSON.stringify({ authorize: token }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.msg_type === "authorize") {
      console.log("Authorized!");
      ws.send(JSON.stringify({ balance: 1 }));
      subscribeToTicks();
    }

    if (data.msg_type === "balance") {
      const el = document.getElementById("balance");
      if (el) {
        el.innerText = `${data.balance.balance.toFixed(2)} ${data.balance.currency}`;
      }
    }

    if (data.msg_type === "tick") {
      updateChart(data.tick.quote);
    }

    if (data.msg_type === "proposal") {
      currentProposalId = data.proposal.id;
    }

    if (data.msg_type === "buy") {
      if (data.buy) {
        alert(`Trade placed! Contract ID: ${data.buy.contract_id}\nPayout: ${data.buy.payout.toFixed(2)} USD`);
      } else if (data.error) {
        alert("Trade failed: " + data.error.message);
      }
    }

    if (data.error) {
      console.error("API Error:", data.error);
      if (data.error.code === "InvalidToken") {
        alert("Session expired. Please reconnect.");
        logout();
      } else {
        alert("Error: " + data.error.message);
      }
    }
  };

  ws.onerror = (err) => console.error("WebSocket error:", err);
  ws.onclose = () => console.log("WebSocket closed");
}

// ====================== LIVE TICKS & CHART ======================
function subscribeToTicks() {
  ws.send(JSON.stringify({
    ticks: "R_100",  // Volatility 100 Index
    subscribe: 1
  }));

  initChart();
}

function initChart() {
  const ctx = document.getElementById("tickChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Volatility 100 Index",
        data: [],
        borderColor: "#00ffff",
        backgroundColor: "rgba(0, 255, 255, 0.1)",
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { display: false },
        y: {
          grid: { color: "rgba(0, 255, 255, 0.1)" },
          ticks: { color: "#e0f8ff" }
        }
      },
      plugins: {
        legend: { display: false }
      },
      animation: { duration: 0 }
    }
  });
}

function updateChart(price) {
  if (!chart) return;

  const now = new Date().toLocaleTimeString();
  chart.data.labels.push(now);
  chart.data.datasets[0].data.push(price);

  // Keep only last 50 points
  if (chart.data.labels.length > 50) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();
}

// ====================== BUY CONTRACT (Rise/Fall) ======================
function buyContract(direction) {
  const stake = parseFloat(document.getElementById("stake").value);

  if (!stake || stake < 0.35) {
    alert("Minimum stake is 0.35 USD");
    return;
  }

  // Get proposal first
  ws.send(JSON.stringify({
    proposal: 1,
    amount: stake,
    basis: "stake",
    contract_type: direction === "CALL" ? "CALL" : "PUT",
    currency: "USD",
    duration: 5,
    duration_unit: "m",
    symbol: "R_100"
  }));
}

// Override onmessage to handle proposal then buy
// We'll use a global to store proposal
// But simpler: wait for proposal response, then buy
// In this version, we set currentProposalId and buy immediately after proposal

// Modify the onmessage to auto-buy after proposal
// But for safety, let's add a small delay or use the response

// Better: separate proposal and buy steps
let pendingBuy = null;

ws && (ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // ... previous handlers ...

  if (data.msg_type === "proposal" && pendingBuy) {
    ws.send(JSON.stringify({
      buy: data.proposal.id,
      price: data.proposal.ask_price
    }));
    pendingBuy = null;
  }
});

// Update buyContract function
function buyContract(direction) {
  const stake = parseFloat(document.getElementById("stake").value);

  if (!stake || stake < 0.35) {
    alert("Minimum stake is 0.35 USD");
    return;
  }

  pendingBuy = { direction, stake };

  ws.send(JSON.stringify({
    proposal: 1,
    amount: stake,
    basis: "stake",
    contract_type: direction === "CALL" ? "CALL" : "PUT",
    currency: "USD",
    duration: 5,
    duration_unit: "m",
    symbol: "R_100"
  }));
}

// ====================== LOGOUT ======================
function logout() {
  localStorage.removeItem("deriv_token");
  if (ws) ws.close();
  window.location.href = "index.html";
          }
