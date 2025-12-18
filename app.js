const APP_ID = "112117"; // CHANGE TO YOUR ACTUAL APP_ID FROM DERIV DASHBOARD

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

if (window.location.pathname.toLowerCase().includes("dashboard")) {
  const token = localStorage.getItem("deriv_token");

  if (!token) {
    alert("Please connect to Deriv first.");
    window.location.href = "index.html";
  } else {
    const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);

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
          `${data.balance.balance.toFixed(2)} ${data.balance.currency}`;
      }

      if (data.error) {
        alert("Error: " + data.error.message);
        if (data.error.code === "InvalidToken") logout();
      }
    };
  }
}

function logout() {
  localStorage.removeItem("deriv_token");
  window.location.href = "index.html";
              }
