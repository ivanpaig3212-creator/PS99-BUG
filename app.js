const API_BASE = "https://ps99.biggamesapi.io";
let allItems = [];
let currentTab = 'all';

async function fetchLiveRAP() {
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const lastUpdated = document.getElementById('last-updated');

    loading.style.display = 'block';
    results.innerHTML = '';

    try {
        const [rapRes, existsRes] = await Promise.all([
            fetch(`${API_BASE}/api/rap`),
            fetch(`${API_BASE}/api/exists`)
        ]);

        const rapData = await rapRes.json();
        const existsData = await existsRes.json();

        lastUpdated.textContent = `Live • Updated ${new Date().toLocaleTimeString()}`;

        const saved = JSON.parse(localStorage.getItem('ps99_rap_data') || '{}');
        const previousData = saved.data || {};
        const lastSavedTime = saved.timestamp || 0;
        const now = Date.now();
        const THIRTY_MINUTES = 30 * 60 * 1000;

        allItems = rapData.data
            .map(rapItem => {
                const existsItem = existsData.data.find(e => 
                    e.configData?.id === rapItem.configData?.id
                );

                const name = rapItem.configData?.id || "Unknown";
                const rap = rapItem.value || 0;
                const exists = existsItem?.value || 0;
                let category = rapItem.category || "Misc";

                const config = rapItem.configData || {};
                
                let variant = "";
                if (config.pt === 1) variant = "Golden";
                if (config.pt === 2) variant = "Rainbow";
                if (config.sh === true) variant = variant ? `Shiny ${variant}` : "Shiny";

                const displayName = variant ? `${variant} ${name}` : name;

                const previousRap = previousData[displayName] || rap;
                const changePercent = previousRap > 0 ? ((rap - previousRap) / previousRap) * 100 : 0;

                const isInflated = changePercent >= 10;
                const isDeflated = changePercent <= -10;

                const lowerName = name.toLowerCase();
                if (lowerName.includes('gift') || lowerName.includes('present')) category = 'Gift';

                return {
                    name: displayName,
                    originalName: name,
                    category,
                    variant,
                    rap,
                    exists,
                    previousRap,
                    changePercent: Math.round(changePercent),
                    isInflated,
                    isDeflated,
                    thumbnail: config.thumbnail || config.goldenThumbnail || ""
                };
            })
            // Filter logic
            .filter(item => {
                const lowerName = item.originalName.toLowerCase();

                if (item.category === "Pet") {
                    const isSpecialPet = item.variant || 
                                         lowerName.includes("huge") ||
                                         lowerName.includes("titanic") ||
                                         lowerName.includes("gargantuan");
                    return isSpecialPet;
                }

                if (item.category === "Enchant") {
                    return lowerName.includes("exclusive");
                }

                if (item.category === "Charm" || item.category === "Item" || item.category === "MiscItems") {
                    return lowerName.includes("exclusive") || 
                           lowerName.includes("limited") || 
                           lowerName.includes("event");
                }

                return true;
            });

        if (now - lastSavedTime > THIRTY_MINUTES) {
            const newData = {};
            allItems.forEach(item => newData[item.name] = item.rap);
            localStorage.setItem('ps99_rap_data', JSON.stringify({
                data: newData,
                timestamp: now
            }));
        }

        loading.style.display = 'none';
        renderItems(allItems);

    } catch (e) {
        console.error(e);
        loading.style.display = 'none';
        results.innerHTML = `<p style="color:#ff6b6b;text-align:center;padding:40px;">Failed to load data</p>`;
    }
}

function renderItems(items) {
    const results = document.getElementById('results');
    results.innerHTML = '';

    if (items.length === 0) {
        results.innerHTML = `<p style="text-align:center; padding:40px; color:#888;">No items found.</p>`;
        return;
    }

    items.forEach(item => {
        let imageUrl = "https://via.placeholder.com/60?text=Item";
        
        if (item.thumbnail) {
            const id = item.thumbnail.split(':').pop();
            if (id && !isNaN(id)) {
                imageUrl = `https://ps99.biggamesapi.io/image/${id}`;
            }
        }

        const div = document.createElement('div');
        div.className = `item-row ${item.isInflated ? 'inflated' : ''} ${item.isDeflated ? 'deflated' : ''}`;
        div.style.cursor = 'pointer';
        div.onclick = () => showItemModal(item);

        let changeHTML = '';
        if (item.changePercent !== 0) {
            const color = item.changePercent > 0 ? '#22ff88' : '#ff6b6b';
            const arrow = item.changePercent > 0 ? '▲' : '▼';
            changeHTML = `<div style="color:${color}; font-size:0.9rem; font-weight:600;">${arrow} ${item.changePercent}%</div>`;
        }

        let badgeHTML = '';
        if (item.isInflated) badgeHTML = `<div class="inflated-badge">🔥 INFLATED</div>`;
        if (item.isDeflated) badgeHTML = `<div class="deflated-badge">📉 DEFLATED</div>`;

        div.innerHTML = `
            <div class="item-info">
                <img src="${imageUrl}" class="item-img" onerror="this.src='https://via.placeholder.com/60?text=Item'">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-category">${item.category} ${item.variant ? `• ${item.variant}` : ''}</div>
                </div>
            </div>
            <div class="stats">
                <div class="rap">${item.rap.toLocaleString()} 💎</div>
                <div class="exists">${item.exists.toLocaleString()} exist</div>
                ${changeHTML}
                ${badgeHTML}
            </div>
        `;
        results.appendChild(div);
    });
}

async function showItemModal(item) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;';
    
    modal.innerHTML = `
        <div style="background:#1a1a1a;padding:25px;border-radius:16px;max-width:700px;width:95%;border:1px solid #333;">
            <h2 style="margin-bottom:8px;">${item.name}</h2>
            <p style="color:#888;margin-bottom:15px;">${item.category} ${item.variant ? `• ${item.variant}` : ''}</p>
            
            <div style="margin:20px 0; min-height: 320px; display: flex; align-items: center; justify-content: center;">
                <canvas id="rapChart" width="650" height="320"></canvas>
            </div>

            <div style="text-align:center;margin-bottom:15px;">
                <small style="color:#666;">Trying to load history from ps99rap.com...</small>
            </div>

            <button onclick="this.closest('.modal').remove()" 
                    style="width:100%;padding:14px;background:#ff4757;color:white;border:none;border-radius:10px;font-size:1rem;cursor:pointer;">
                Close
            </button>
        </div>
    `;
    document.body.appendChild(modal);

    // Fetch real RAP history using CORS proxy
    try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
            `https://ps99rap.com/api/item/${item.originalName}/rap_history`
        )}`;

        const res = await fetch(proxyUrl);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (data && data.success && data.data && data.data.length > 0) {
            const canvas = document.getElementById('rapChart');
            if (canvas) canvas.outerHTML = `<canvas id="rapChart" width="650" height="320"></canvas>`;
            drawRealChart(data.data);
        } else {
            document.getElementById('rapChart').outerHTML = `
                <div style="text-align:center; padding: 60px 20px; color:#888;">
                    <p>No historical data available for this item yet.</p>
                    <p style="font-size:0.9rem; margin-top:10px;">This can happen with newer or less traded items.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("History fetch error:", error);
        document.getElementById('rapChart').outerHTML = `
            <div style="text-align:center; padding: 60px 20px; color:#ff6b6b;">
                <p>Failed to load history from ps99rap.com</p>
                <p style="font-size:0.85rem; margin-top:8px; color:#888;">${error.message}</p>
            </div>
        `;
    }
}

function drawRealChart(historyData) {
    const ctx = document.getElementById('rapChart');
    if (!ctx) return;

    const labels = historyData.map(h => new Date(h[0] * 1000).toLocaleDateString());
    const values = historyData.map(h => h[1]);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'RAP History',
                data: values,
                borderColor: '#ff4757',
                backgroundColor: 'rgba(255, 71, 87, 0.1)',
                borderWidth: 2.5,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    ticks: { color: '#aaa' },
                    grid: { color: '#333' }
                },
                x: { 
                    ticks: { color: '#aaa', maxTicksLimit: 8 },
                    grid: { color: '#333' }
                }
            }
        }
    });
}

function filterItems() {
    const searchTerm = document.getElementById('search').value.toLowerCase().trim();
    let filtered = allItems;

    if (currentTab === 'inflated') filtered = filtered.filter(i => i.isInflated);
    else if (currentTab === 'deflated') filtered = filtered.filter(i => i.isDeflated);
    else if (currentTab !== 'all') filtered = filtered.filter(i => i.category === currentTab);

    if (searchTerm) {
        filtered = filtered.filter(i => 
            i.name.toLowerCase().includes(searchTerm) || 
            i.originalName.toLowerCase().includes(searchTerm)
        );
    }
    renderItems(filtered);
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    filterItems();
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLiveRAP();
    setInterval(fetchLiveRAP, 60000);
});