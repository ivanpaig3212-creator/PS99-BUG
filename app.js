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

        allItems = rapData.data.map(rapItem => {
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
            if (lowerName.includes('exclusive') || lowerName.includes('limited')) category = 'Exclusive';

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

    items.forEach(item => {
        // Better image handling
        let imageUrl = "https://via.placeholder.com/60?text=Pet";
        
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
                <img src="${imageUrl}" class="item-img" onerror="this.src='https://via.placeholder.com/60?text=Pet'">
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

function showItemModal(item) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;';
    
    const previousText = item.previousRap > 0 
        ? `${item.previousRap.toLocaleString()} 💎` 
        : 'No previous data yet';

    modal.innerHTML = `
        <div style="background:#1a1a1a;padding:25px;border-radius:16px;max-width:520px;width:92%;border:1px solid #333;">
            <h2 style="margin-bottom:8px;">${item.name}</h2>
            <p style="color:#888;margin-bottom:15px;">${item.category} ${item.variant ? `• ${item.variant}` : ''}</p>
            
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;gap:20px;">
                <div>
                    <div style="color:#888;font-size:0.85rem;">Current RAP</div>
                    <div style="font-size:1.7rem;font-weight:bold;color:#ffd700;">${item.rap.toLocaleString()} 💎</div>
                </div>
                <div style="text-align:right;">
                    <div style="color:#888;font-size:0.85rem;">Exists</div>
                    <div style="font-size:1.3rem;color:#22ff88;">${item.exists.toLocaleString()}</div>
                </div>
            </div>

            <div style="background:#111;padding:15px;border-radius:10px;margin-bottom:15px;">
                <div style="color:#888;font-size:0.85rem;margin-bottom:4px;">Previous RAP (last check)</div>
                <div style="font-size:1.3rem;color:#ccc;">${previousText}</div>
                
                <div style="margin-top:10px;">
                    <div style="color:#888;font-size:0.85rem;">Change</div>
                    <div style="font-size:1.4rem;font-weight:700;color:${item.changePercent >= 0 ? '#22ff88' : '#ff6b6b'}">
                        ${item.changePercent >= 0 ? '▲' : '▼'} ${item.changePercent}%
                    </div>
                </div>
            </div>

            <div style="font-size:0.8rem;color:#666;margin-bottom:20px;text-align:center;">
                Full long-term RAP history is available on <strong>ps99rap.com</strong><br>
                This shows change since your last visit.
            </div>

            <button onclick="this.closest('.modal').remove()" 
                    style="width:100%;padding:14px;background:#ff4757;color:white;border:none;border-radius:10px;font-size:1rem;cursor:pointer;">
                Close
            </button>
        </div>
    `;
    document.body.appendChild(modal);
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