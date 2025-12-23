// ===============================
// Deriv API – GOTH Trading Hub
// ===============================

const APP_ID = 112117;
const DERIV_WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;

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
      reject("WebSocket connection failed");
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);

      if (data.error) {
        reject(data.error.message);
      }

      if (data.msg_type === "authorize") {
        resolve(data.authorize);
      }
    };
  });
}

// ===============================
// Subscribe to Balance
// ===============================
function subscribeBalance() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(
    JSON.stringify({
      balance: 1,
      subscribe: 1
    })
  );
}

// ===============================
// Run Example Bot / Trade
// ===============================
function runExampleBot() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(
    JSON.stringify({
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
    })
  );
}

// ===============================
// Expose globally
// ===============================
window.ws = ws;
window.connectDeriv = connectDeriv;
window.subscribeBalance = subscribeBalance;
window.runExampleBot = runExampleBot;
