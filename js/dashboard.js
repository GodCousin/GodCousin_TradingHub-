// js/dashboard.js
const APP_ID = "112117";

// Read token from URL
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

// If no token, go back to login
if (!token) {
  window.location.href = "/";
}

// Save token
localStorage.setItem("deriv_token", token);

// Connect to Deriv WebSocket
const ws = new WebSocket(
  "wss://ws.derivws.com/websockets/v3?app_id=" + APP_ID
);

ws.onopen = () => {
  ws.send(
    JSON.stringify({
      authorize: token
    })
  );
};

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  if (data.msg_type === "authorize") {
    document.getElementById("status").innerText =
      "Connected as " + data.authorize.loginid;
  }
};
