const PS99RAP_API = "https://ps99rap.com/api";
let allItems = [];
let currentTab = 'all';

async function fetchLiveData() {
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const lastUpdated = document.getElementById('last-updated');

    loading.style.display = 'block';
    results.innerHTML = '';

    try {
        const res = await fetch(`${PS99RAP_API}/items`);
        const data = await res.json();

        lastUpdated.textContent = `Live from ps99rap.com • ${new Date().toLocaleTimeString()}`;

        allItems = Object.values(data).map(item => {
            const rap = item.rap || 0;
            const exists = item.exists || 0;
            const name = item.name || "Unknown";
            const category = item.category || "Misc";

            // Simple inflation using last known change if available
            const isInflated = rap > 5000000 && exists < 10000;
            const isDeflated = false; // We'll improve this later

            return {
                id: item.id,
                name,
                category,
                rap,
                exists,
                isInflated,
                isDeflated,
                thumbnail: item.thumbnail || ""
            };
        });

        loading.style.display = 'none';
        renderItems(allItems);

    } catch (e) {
        console.error(e);
        loading.style.display = 'none';
        results.innerHTML = `<p style="color:#ff6b6b;text-align:center;padding:40px;">Failed to load from ps99rap.com</p>`;
    }
}

function renderItems(items) {
    const results = document.getElementById('results');
    results.innerHTML = '';

    items.forEach(item => {
        const imageUrl = item.thumbnail 
            ? `https://ps99rap.com${item.thumbnail}` 
            : "https://via.placeholder.com/60";

        const div = document.createElement('div');
        div.className = `item-row ${item.isInflated ? 'inflated' : ''}`;
        div.style.cursor = 'pointer';
        div.onclick = () => showHistoryModal(item);

        div.innerHTML = `
            <div class="item-info">
                <img src="${imageUrl}" class="item-img" onerror="this.style.display='none'">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-category">${item.category}</div>
                </div>
            </div>
            <div class="stats">
                <div class="rap">${item.rap.toLocaleString()} 💎</div>
                <div class="exists">${item.exists.toLocaleString()} exist</div>
            </div>
        `;
        results.appendChild(div);
    });
}

async function showHistoryModal(item) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;';
    
    modal.innerHTML = `
        <div style="background:#1a1a1a;padding:25px;border-radius:16px;max-width:700px;width:95%;border:1px solid #333;">
            <h2 style="margin-bottom:10px;">${item.name}</h2>
            <p style="color:#888;margin-bottom:15px;">Current RAP: <strong style="color:#ffd700;">${item.rap.toLocaleString()} 💎</strong> &nbsp;&nbsp; Exists: <strong style="color:#22ff88;">${item.exists.toLocaleString()}</strong></p>
            
            <div style="margin:20px 0;">
                <canvas id="rapChart" width="600" height="300"></canvas>
            </div>

            <button onclick="this.closest('.modal').remove()" 
                    style="width:100%;padding:12px;background:#ff4757;color:white;border:none;border-radius:10px;font-size:1rem;margin-top:10px;cursor:pointer;">
                Close
            </button>
        </div>
    `;
    modal.className = 'modal';
    document.body.appendChild(modal);

    // Fetch real RAP history
    try {
        const res = await fetch(`${PS99RAP_API}/item/${item.id}/rap_history`);
        const historyData = await res.json();

        if (historyData.success && historyData.data.length > 0) {
            drawChart(historyData.data);
        } else {
            document.getElementById('rapChart').outerHTML = `<p style="text-align:center;color:#888;">No history data available for this item yet.</p>`;
        }
    } catch (e) {
        console.error(e);
        document.getElementById('rapChart').outerHTML = `<p style="text-align:center;color:#ff6b6b;">Failed to load history.</p>`;
    }
}

function drawChart(history) {
    const ctx = document.getElementById('rapChart');
    if (!ctx) return;

    const labels = history.map(h => new Date(h[0] * 1000).toLocaleDateString());
    const values = history.map(h => h[1]);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'RAP',
                data: values,
                borderColor: '#ff4757',
                backgroundColor: 'rgba(255,71,87,0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { color: '#aaa' } },
                x: { ticks: { color: '#aaa', maxTicksLimit: 8 } }
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
        filtered = filtered.filter(i => i.name.toLowerCase().includes(searchTerm));
    }
    renderItems(filtered);
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    filterItems();
}

document.addEventListener('DOMContentLoaded', fetchLiveData);