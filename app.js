const API_BASE = "https://ps99.biggamesapi.io";
let allItems = [];

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

        lastUpdated.textContent = `Live • ${new Date().toLocaleTimeString()}`;

        allItems = rapData.data.map(rapItem => {
            const existsItem = existsData.data.find(e => 
                e.configData?.id === rapItem.configData?.id
            );

            const rap = rapItem.value || 0;
            const exists = existsItem?.value || 0;
            const name = rapItem.configData?.id || "Unknown";
            const category = rapItem.category || "Misc";

            // Inflated Detector Logic
            const rapPerExist = exists > 0 ? rap / exists : 0;
            const isInflated = rap > 1_000_000 && (rapPerExist > 1000 || rap > 50_000_000);

            return {
                name,
                category,
                rap,
                exists,
                isInflated,
                thumbnail: rapItem.configData?.thumbnail || ""
            };
        });

        renderItems(allItems);
        loading.style.display = 'none';

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
        div.className = `item-row ${item.isInflated ? 'inflated' : ''}`;
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
                ${item.isInflated ? `<div class="inflated-badge">🔥 INFLATED</div>` : ''}
            </div>
        `;
        results.appendChild(div);
    });
}

function filterCategory(cat) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (cat === 'all') {
        renderItems(allItems);
    } else {
        const filtered = allItems.filter(item => item.category === cat);
        renderItems(filtered);
    }
}

// Start
document.addEventListener('DOMContentLoaded', fetchLiveRAP);