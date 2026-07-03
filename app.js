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

        allItems = rapData.data.map(rapItem => {
            const existsItem = existsData.data.find(e => 
                e.configData?.id === rapItem.configData?.id
            );

            const rap = rapItem.value || 0;
            const exists = existsItem?.value || 0;
            const name = rapItem.configData?.id || "Unknown";
            let category = rapItem.category || "Misc";

            // Smart Inflation Detection (much stricter)
            const rapPerExist = exists > 0 ? rap / exists : 0;
            const isInflated = 
                (rap > 10_000_000 && exists < 5000) ||           // Very high value + low supply
                (rapPerExist > 80000) ||                         // Extremely expensive per copy
                (rap > 200_000_000);                             // Ultra high RAP items

            // Categorize Gifts & Exclusive
            if (name.toLowerCase().includes('gift') || name.toLowerCase().includes('present')) {
                category = 'Gift';
            }
            if (name.toLowerCase().includes('exclusive') || name.toLowerCase().includes('limited')) {
                category = 'Exclusive';
            }

            return {
                name,
                category,
                rap,
                exists,
                isInflated,
                thumbnail: rapItem.configData?.thumbnail || ""
            };
        });

        loading.style.display = 'none';
        renderItems(allItems);

    } catch (e) {
        console.error(e);
        loading.style.display = 'none';
        results.innerHTML = `<p style="color:#ff6b6b; text-align:center; padding:40px;">Failed to load data. Try again later.</p>`;
    }
}

function renderItems(items) {
    const results = document.getElementById('results');
    results.innerHTML = '';

    if (items.length === 0) {
        results.innerHTML = `<p style="text-align:center; padding:30px; color:#888;">No items found.</p>`;
        return;
    }

    items.forEach(item => {
        const imageUrl = item.thumbnail 
            ? `https://ps99.biggamesapi.io/image/${item.thumbnail.split(':').pop()}`
            : "https://via.placeholder.com/60?text=Item";

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
                ${item.isInflated ? `<div class="inflated-badge">🔥 LIKELY INFLATED</div>` : ''}
            </div>
        `;
        results.appendChild(div);
    });
}

function filterItems() {
    const searchTerm = document.getElementById('search').value.toLowerCase().trim();
    
    let filtered = allItems;

    // Apply current tab filter
    if (currentTab === 'inflated') {
        filtered = filtered.filter(item => item.isInflated);
    } else if (currentTab !== 'all') {
        filtered = filtered.filter(item => item.category === currentTab);
    }

    // Apply search
    if (searchTerm.length > 0) {
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        );
    }

    renderItems(filtered);
}

function switchTab(tab) {
    currentTab = tab;
    
    // Update active tab styling
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Re-filter
    filterItems();
}

// Auto load + refresh every 60 seconds
document.addEventListener('DOMContentLoaded', () => {
    fetchLiveRAP();
    setInterval(fetchLiveRAP, 60000);
});