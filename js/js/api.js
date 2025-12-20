let ws;

function connect(token) {
  ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=112117");

  ws.onopen = () => {
    ws.send(JSON.stringify({ authorize: token }));
  };

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    console.log("Deriv:", data);
  };
}
