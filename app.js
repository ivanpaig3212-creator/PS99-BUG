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

        const previousData = JSON.parse(localStorage.getItem('ps99_previous_rap') || '{}');

        allItems = rapData.data.map(rapItem => {
            const existsItem = existsData.data.find(e => 
                e.configData?.id === rapItem.configData?.id
            );

            const name = rapItem.configData?.id || "Unknown";
            const rap = rapItem.value || 0;
            const exists = existsItem?.value || 0;
            let category = rapItem.category || "Misc";

            // === VARIANT DETECTION ===
            const config = rapItem.configData || {};
            let variant = "";

            if (config.pt === 1) variant = "Golden";
            if (config.pt === 2) variant = "Rainbow";
            if (config.sh === true) variant = variant ? `Shiny ${variant}` : "Shiny";

            // Combine name + variant for display
            const displayName = variant ? `${variant} ${name}` : name;

            const previousRap = previousData[displayName] || rap;
            const changePercent = previousRap > 0 ? ((rap - previousRap) / previousRap) * 100 : 0;

            // 10% threshold
            const isInflated = changePercent >= 10;
            const isDeflated = changePercent <= -10;

            // Auto categorize
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

        // Save current data
        const newPreviousData = {};
        allItems.forEach(item => newPreviousData[item.name] = item.rap);
        localStorage.setItem('ps99_previous_rap', JSON.stringify(newPreviousData));

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
        const imageUrl = item.thumbnail 
            ? `https://ps99.biggamesapi.io/image/${item.thumbnail.split(':').pop()}`
            : "https://via.placeholder.com/60";

        const div = document.createElement('div');
        div.className = `item-row ${item.isInflated ? 'inflated' : ''} ${item.isDeflated ? 'deflated' : ''}`;

        let changeHTML = '';
        if (item.changePercent !== 0) {
            const isPositive = item.changePercent > 0;
            const color = isPositive ? '#22ff88' : '#ff6b6b';
            const arrow = isPositive ? '▲' : '▼';
            changeHTML = `<div style="color:${color}; font-size:0.9rem; font-weight:600;">${arrow} ${item.changePercent}%</div>`;
        }

        let badgeHTML = '';
        if (item.isInflated) {
            badgeHTML = `<div class="inflated-badge">🔥 INFLATED</div>`;
        } else if (item.isDeflated) {
            badgeHTML = `<div class="deflated-badge">📉 DEFLATED</div>`;
        }

        div.innerHTML = `
            <div class="item-info">
                <img src="${imageUrl}" class="item-img" onerror="this.style.display='none'">
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

function filterItems() {
    const searchTerm = document.getElementById('search').value.toLowerCase().trim();
    let filtered = allItems;

    if (currentTab === 'inflated') {
        filtered = filtered.filter(item => item.isInflated);
    } else if (currentTab === 'deflated') {
        filtered = filtered.filter(item => item.isDeflated);
    } else if (currentTab !== 'all') {
        filtered = filtered.filter(item => item.category === currentTab);
    }

    if (searchTerm.length > 0) {
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.originalName.toLowerCase().includes(searchTerm)
        );
    }

    renderItems(filtered);
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    filterItems();
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLiveRAP();
    setInterval(fetchLiveRAP, 60000);
});