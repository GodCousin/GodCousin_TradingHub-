let ws;

function connect(token) {
  ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=112117");

  ws.onopen = () => {
    ws.send(JSON.stringify({ authorize: token }));
  };

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);

    // Show balance if available
    if (data.msg_type === "balance") {
      document.getElementById("balance").innerText =
        `${data.balance.currency} ${data.balance.balance}`;
    }

    console.log("Deriv WS message:", data);
  };
}
