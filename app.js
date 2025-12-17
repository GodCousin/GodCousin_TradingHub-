// ====================== CONFIG ======================
const APP_ID = "112117";  // Replace with your actual app_id if different
// No need for BASE_URL or manual REDIRECT_URI — Deriv uses the one registered in dashboard

// ====================== LOGIN FUNCTION ======================
function loginDeriv() {
  // Correct OAuth URL — do NOT include redirect_uri manually
  const authUrl = `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}&l=en`;
  
  window.location.href = authUrl;
}

// ====================== TOKEN EXTRACTION ======================
function extractToken() {
  // Deriv returns tokens in QUERY parameters (?token1=...), NOT in hash (#)
  const params = new URLSearchParams(window.location.search);
  
  // Primary account token is "token1"
  return params.get("token1");
}

// Run on page load — captures token after redirect
const tokenFromUrl = extractToken();

if (tokenFromUrl) {
  // Save token for later use
  localStorage.setItem("deriv_token", tokenFromUrl);
  
  // Clean the URL (remove ?token1=... etc.) for better UX and security
  window.history.replaceState({}, document.title, "/");
  
  // Redirect to dashboard if not already there
  if (!window.location.pathname.includes("Dashboard.html") && 
      !window.location.pathname.includes("dashboard.html")) {
    window.location.href = "Dashboard.html";
  }
}

// ====================== DASHBOARD LOGIC ======================
if (window.location.pathname.toLowerCase().includes("dashboard")) {
  const token = localStorage.getItem("deriv_token");

  if (!token) {
    alert("Please connect to Deriv first.");
    window.location.href = "index.html";  // or "/" 
  } else {
    // Correct WebSocket endpoint
    const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ authorize: token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Successful authorization
      if (data.msg_type === "authorize") {
        console.log("Authorized successfully:", data.authorize);
        // Request balance
        ws.send(JSON.stringify({ balance: 1 }));
      }

      // Balance update
      if (data.msg_type === "balance") {
        const balanceEl = document.getElementById("balance");
        if (balanceEl) {
          balanceEl.innerText = 
            `${data.balance.balance.toFixed(2)} ${data.balance.currency}`;
        }
      }

      // Handle errors (e.g. invalid/expired token)
      if (data.error) {
        console.error("API Error:", data.error);
        alert(`Error: ${data.error.message}`);
        logout();  // Clear token and go back to login
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };
  }
}

// ====================== LOGOUT FUNCTION ======================
function logout() {
  localStorage.removeItem("deriv_token");
  window.location.href = "index.html";  // or "/"
    }
