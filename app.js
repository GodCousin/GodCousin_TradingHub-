// app.js - Updated for GitHub Pages deployment

const derivAppId = "112117";
const redirectUri = "https://YOUR_USERNAME.github.io/godcousin-trading-hub"; 
let authToken = null;
let ws = null;

const instruments = [
    'frxEURUSD','frxGBPUSD','frxUSDJPY','frxAUDUSD',
    'CRYPTO:BTCUSD','CRYPTO:ETHUSD','CRYPTO:LTCUSD',
    'frxXAUUSD','frxXAGUSD',
    'IDX:US500','IDX:UK100','IDX:GER30',
    'R_100','R_50','R_25','R_10'
];

const charts = {};
const latestData = {};
const trades = {};

// ===== LOGIN =====
function login() {
    const authUrl = `https://oauth.deriv.com/oauth2/authorize?app_id=${derivAppId}&l=EN&brand=deriv&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token`;
    window.location.href = authUrl;
}

// ===== LOAD DASHBOARD =====
function loadDashboard() {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    authToken = params.get('access_token');

    if (authToken) {
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("dashboard").style.display = "grid";

        createInstrumentCards();
        initWebSocket();
        fetchAccountInfo();
    }
}

// ===== CREATE CARDS =====
function createInstrumentCards() {
    const dashboard = document.getElementById('dashboard');
    instruments.forEach(symbol => {
        latestData[symbol] = [];
        trades[symbol] = null;

        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${symbol}`;
        card.innerHTML = `
            <h2>${symbol}</h2>
            <p id="price-${symbol}">Loading...</p>
            <canvas id="chart-${symbol}" class="chart-container"></canvas>
            <canvas id="radar-${symbol}" class="chart-container"></canvas>
            <p id="trade-${symbol}">No trade yet</p>
            <button onclick="buy('${symbol}')">Buy</button>
            <button onclick="sell('${symbol}')">Sell</button>
        `;
        dashboard.appendChild(card);

        // Line chart
        const ctx = document.getElementById(`chart-${symbol}`).getContext('2d');
        charts[symbol] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: symbol, data: [], borderColor: '#ff4f00', backgroundColor: 'rgba(255,79,0,0.2)', fill: true, tension: 0.3 },
                    { label: 'SMA', data: [], borderColor: '#00fffc', borderDash: [5,5], fill: false, tension: 0.3 },
                    { label: 'EMA', data: [], borderColor: '#ff00ff', fill: false, tension: 0.3 }
                ]
            },
            options: { responsive: true, plugins: { legend: { labels: { color: '#00fffc' } } }, scales: { x: { ticks: { color: '#00fffc' } }, y: { ticks: { color: '#00fffc' } } } }
        });

        // Radar chart
        const radarCtx = document.getElementById(`radar-${symbol}`).getContext('2d');
        charts[`radar-${symbol}`] = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Momentum','Volatility','Trend Strength','Volume','RSI'],
                datasets: [{
                    label: 'Analysis',
                    data: [0,0,0,0,0],
                    backgroundColor: 'rgba(0,255,252,0.2)',
                    borderColor: '#00fffc',
                    borderWidth: 2,
                    pointBackgroundColor: '#ff4f00'
                }]
            },
            options: {
                responsive: true,
                scales: { r: { grid: { color: '#00fffc55' }, angleLines: { color: '#00fffc55' }, pointLabels: { color: '#00fffc', font: { size: 12 } }, suggestedMin: 0, suggestedMax: 100 } },
                plugins: { legend: { labels: { color: '#00fffc' } } }
            }
        });
    });
}

// ===== WEBSOCKET =====
function initWebSocket() {
    ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${derivAppId}`);

    ws.onopen = () => {
        console.log('WebSocket connected');
        instruments.forEach(symbol => ws.send(JSON.stringify({ ticks: symbol, subscribe: 1 })));
    };

    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.tick) {
            const symbol = data.tick.symbol || data.tick.name;
            const price = data.tick.quote;

            if (!latestData[symbol]) latestData[symbol] = [];
            if (latestData[symbol].length > 20) latestData[symbol].shift();
            latestData[symbol].push(price);

            const chartData = charts[symbol];
            if (chartData) {
                chartData.data.labels = latestData[symbol].map((_,i)=>i+1);
                chartData.data.datasets[0].data = latestData[symbol];
                chartData.data.datasets[1].data = calculateSMA(latestData[symbol],5);
                chartData.data.datasets[2].data = calculateEMA(latestData[symbol],5);
                chartData.update();
            }

            const radarChart = charts[`radar-${symbol}`];
            if (radarChart) {
                const momentum = latestData[symbol].length>1 ? Math.abs(latestData[symbol].slice(-1)[0]-latestData[symbol].slice(-2)[0])*100 : 0;
                const volatility = (Math.max(...latestData[symbol])-Math.min(...latestData[symbol]))*100;
                const trend = calculateSMA(latestData[symbol],5).slice(-1)[0] || 0;
                const volume = 50; 
                const rsi = 50; 
                radarChart.data.datasets[0].data = [momentum, volatility, trend, volume, rsi];
                radarChart.update();
            }

            const priceEl = document.getElementById(`price-${symbol}`);
            if (priceEl) priceEl.innerText = `Price: ${price}`;

            updateTradePL(symbol, price);
        }
    };

    ws.onclose = () => console.log('WebSocket disconnected');
}

// ===== ACCOUNT INFO =====
async function fetchAccountInfo() {
    try {
        const response = await fetch('https://api.deriv.com/api/v1/account', { headers: { Authorization: `Bearer ${authToken}` } });
        const data = await response.json();
        document.getElementById("balance").innerText = `Balance: ${data.balance || 'N/A'} USD`;
    } catch (err) {
        console.error(err);
        document.getElementById("balance").innerText = 'Error fetching balance';
    }
}

// ===== TRADE FUNCTIONS =====
function buy(symbol) {
    const price = latestData[symbol][latestData[symbol].length-1];
    trades[symbol] = { type: 'Buy', price, pl: 0 };
    document.getElementById(`trade-${symbol}`).innerText = `Bought at ${price}`;
}

function sell(symbol) {
    const price = latestData[symbol][latestData[symbol].length-1];
    trades[symbol] = { type: 'Sell', price, pl: 0 };
    document.getElementById(`trade-${symbol}`).innerText = `Sold at ${price}`;
}

function updateTradePL(symbol, currentPrice) {
    if (trades[symbol]) {
        const trade = trades[symbol];
        trade.pl = trade.type==='Buy'? currentPrice-trade.price : trade.price-currentPrice;
        document.getElementById(`trade-${symbol}`).innerText = `${trade.type} at ${trade.price} | P/L: ${trade.pl.toFixed(2)}`;
    }
}

// ===== SMA & EMA CALC =====
function calculateSMA(data, period) {
    if (data.length < period) return Array(data.length).fill(null);
    const sma = [];
    for (let i=0;i<data.length;i++){
        if(i<period-1){ sma.push(null); continue; }
        const sum = data.slice(i-period+1,i+1).reduce((a,b)=>a+b,0);
        sma.push(sum/period);
    }
    return sma;
}

function calculateEMA(data, period) {
    if (data.length === 0) return [];
    const ema = [];
    const k = 2/(period+1);
    data.forEach((price,i)=>{
        if(i===0) ema.push(price);
        else ema.push(price*k + ema[i-1]*(1-k));
    });
    return ema;
}

// ===== EVENT LISTENERS =====
document.getElementById("loginButton").addEventListener("click", login);
window.addEventListener("load", loadDashboard);
