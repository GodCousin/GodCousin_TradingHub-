// ... (keep previous config, login, token, websocket, logout from before) ...

// Add to onmessage for balance and ticks (keep existing)

// ====================== INDICATORS & CHART ======================
let showSMA = false;
let showRSI = false;
let prices = [];  // Store historical prices for indicators

function toggleIndicator(type) {
  if (type === 'sma') {
    showSMA = !showSMA;
    document.getElementById('smaToggle').classList.toggle('active');
  } else if (type === 'rsi') {
    showRSI = !showRSI;
    document.getElementById('rsiToggle').classList.toggle('active');
  }
  updateChart(prices[prices.length - 1] || 0);  // Redraw chart
}

function initChart() {
  const ctx = document.getElementById("tickChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Price",
          data: [],
          borderColor: "#00ffff",
          backgroundColor: "rgba(0, 255, 255, 0.1)",
          borderWidth: 3,
          pointRadius: 0,
          tension: 0.4,
          fill: true
        },
        {
          label: "SMA (20)",
          data: [],
          borderColor: "#ffcc00",
          borderWidth: 2,
          pointRadius: 0,
          hidden: !showSMA
        },
        {
          label: "RSI (14)",
          data: [],
          borderColor: "#ff00ff",
          borderWidth: 2,
          pointRadius: 0,
          hidden: !showRSI,
          yAxisID: 'rsi'  // Separate scale for RSI
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { display: false },
        y: {
          grid: { color: "rgba(0, 255, 255, 0.1)" },
          ticks: { color: "#e0f8ff" }
        },
        rsi: {
          type: 'linear',
          position: 'right',
          min: 0,
          max: 100,
          grid: { display: false },
          ticks: { color: "#ff00ff" }
        }
      },
      plugins: { legend: { display: true, labels: { color: "#e0f8ff" } } },
      animation: { duration: 0 }
    }
  });
}

function updateChart(price) {
  if (!chart) return;

  prices.push(price);
  if (prices.length > 50) prices.shift();  // Keep last 50

  const labels = Array.from({length: prices.length}, (_, i) => i);
  
  chart.data.labels = labels;
  chart.data.datasets[0].data = prices;
  
  // SMA (20-period)
  if (showSMA) {
    chart.data.datasets[1].data = calculateSMA(prices, 20);
    chart.data.datasets[1].hidden = false;
  } else {
    chart.data.datasets[1].hidden = true;
  }
  
  // RSI (14-period)
  if (showRSI) {
    chart.data.datasets[2].data = calculateRSI(prices, 14);
    chart.data.datasets[2].hidden = false;
  } else {
    chart.data.datasets[2].hidden = true;
  }

  chart.update();
}

function calculateSMA(prices, period) {
  return prices.map((_, i) => {
    if (i < period - 1) return null;
    const slice = prices.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

function calculateRSI(prices, period) {
  let rsi = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(null);
      continue;
    }
    let gains = 0, losses = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const change = prices[j] - prices[j - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  return rsi;
}

// ... (keep subscribeToTicks, buyContract, etc. from before) ...
