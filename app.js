// app.js - Live RAP Fetcher for Pet Simulator 99

const API_BASE = "https://ps99.biggamesapi.io";

async function fetchLiveRAP() {
    const loadingEl = document.getElementById('loading');
    const resultsEl = document.getElementById('results');
    const lastUpdatedEl = document.getElementById('last-updated');

    loadingEl.style.display = 'block';
    resultsEl.innerHTML = '';

    try {
        // Fetch RAP data
        const rapResponse = await fetch(`${API_BASE}/api/rap`);
        const rapData = await rapResponse.json();

        // Fetch Exists (supply) data
        const existsResponse = await fetch(`${API_BASE}/api/exists`);
        const existsData = await existsResponse.json();

        if (rapData.status !== "ok") throw new Error("Failed to load RAP");

        loadingEl.style.display = 'none';

        // Display last updated time
        const now = new Date();
        lastUpdatedEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;

        // Render RAP items
        rapData.data.slice(0, 100).forEach(item => {  // Show top 100
            const div = document.createElement('div');
            div.className = "rap-item";
            
            const name = item.configData.id || "Unknown";
            const category = item.category || "Item";
            const value = item.value.toLocaleString();

            div.innerHTML = `
                <div class="item-info">
                    <strong>${name}</strong>
                    <small>${category}</small>
                </div>
                <div class="value">${value} 💎</div>
            `;
            resultsEl.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        loadingEl.style.display = 'none';
        resultsEl.innerHTML = `
            <p style="color: red; text-align: center;">
                ❌ Failed to fetch live data.<br>
                Please check your connection and try again.
            </p>`;
    }
}

// Auto-refresh every 60 seconds
function startAutoRefresh() {
    fetchLiveRAP();
    setInterval(fetchLiveRAP, 60000); // 1 minute
}

// Run when page loads
document.addEventListener('DOMContentLoaded', startAutoRefresh);