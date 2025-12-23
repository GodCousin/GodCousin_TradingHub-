// ===============================
// Deriv API WebSocket
// ===============================

const DERIV_WS_URL = "wss://ws.derivws.com/websockets/v3?app_id=112117";

let ws = null;

// ===============================
// Connect & Authorize
// ===============================
function connectDeriv(token) {
  return new Promise((resolve, reject) => {
    ws = new WebSocket(DERIV_WS_URL);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          authorize: token
        })
      );
    };

    ws.onerror = () => {
      reject("WebSocket error");
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);

      if (data.error) {
        reject(data.error.message);
        return;
      }

      if (data.msg_type === "authorize") {
        // ✅ expose ws ONLY after successful auth
        window.ws = ws;
        resolve(data.authorize);
      }
    };
  });
}

// ===============================
// Balance Subscription
// ===============================
function subscribeBalance() {
  if (!window.ws || window.ws.readyState !== 1) {
    console.error("WebSocket not connected");
    return;
  }

  window.ws.send(
    JSON.stringify({
      balance: 1,
      subscribe: 1
    })
  );
}

// ===============================
// Expose functions
// ===============================
window.connectDeriv = connectDeriv;
window.subscribeBalance = subscribeBalance;
