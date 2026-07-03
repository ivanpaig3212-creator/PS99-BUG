// app.js - Professional PS99 Inflated RAP Tracker
const API_BASE = "https://ps99.biggamesapi.io";

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

        // Combine and filter for likely inflated items
        const items = rapData.data.map(rapItem => {
            const existsItem = existsData.data.find(e => 
                e.configData?.id === rapItem.configData?.id
            );
            
            const rap = rapItem.value || 0;
            const exists = existsItem?.value || 0;
            const name = rapItem.configData?.id || "Unknown";
            const category = rapItem.category || "Item";

            // Score for "inflated" detection (high RAP + relatively low supply)
            const inflatedScore = exists > 0 ? (rap / exists) : rap;

            return {
                ...rapItem,
                exists: exists,
                inflatedScore: inflatedScore,
                name: name,
                category: category
            };
        });

        // Filter: High value OR suspicious ratio (likely manipulated)
        const suspiciousItems = items
            .filter(item => item.rap > 500_000) // Minimum RAP
            .sort((a, b) => b.inflatedScore - a.inflatedScore); // Most suspicious first

        loading.style.display = 'none';

        if (suspiciousItems.length === 0) {
            results.innerHTML = "<p>No suspicious activity detected right now.</p>";
            return;
        }

        suspiciousItems.forEach(item => {
            const rap = item.value.toLocaleString();
            const exists = item.exists.toLocaleString();
            const name = item.name;
            const category = item.category;

            const thumbnail = item.configData?.thumbnail || "";
            const imageUrl = thumbnail 
                ? `https://ps99.biggamesapi.io/image/${thumbnail.split(':').pop()}`
                : "https://via.placeholder.com/64?text=Item";

            const div = document.createElement('div');
            div.className = "item-row";
            div.innerHTML = `
                <div class="item-info">
                    <img src="${imageUrl}" alt="${name}" class="item-img" onerror="this.style.display='none'">
                    <div>
                        <div class="item-name">${name}</div>
                        <div class="item-category">${category}</div>
                    </div>
                </div>
                <div class="stats">
                    <div><strong>${rap}</strong> 💎</div>
                    <div class="exists">${exists} exist</div>
                </div>
            `;
            results.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        loading.style.display = 'none';
        results.innerHTML = `<p style="color:#ff6b6b;text-align:center;">Error loading data. Please refresh.</p>`;
    }
}

// Auto refresh
document.addEventListener('DOMContentLoaded', () => {
    fetchLiveRAP();
    setInterval(fetchLiveRAP, 45000); // every 45 seconds
});