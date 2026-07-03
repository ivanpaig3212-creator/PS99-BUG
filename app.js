// app.js
const API_BASE = "https://ps99.biggamesapi.io";

async function fetchLiveRAP() {
    const loadingEl = document.getElementById('loading');
    const resultsEl = document.getElementById('results');
    const lastUpdatedEl = document.getElementById('last-updated');

    loadingEl.style.display = 'block';
    resultsEl.innerHTML = '';

    try {
        const [rapRes, existsRes] = await Promise.all([
            fetch(`${API_BASE}/api/rap`),
            fetch(`${API_BASE}/api/exists`)
        ]);

        const rapData = await rapRes.json();
        const existsData = await existsRes.json();

        if (rapData.status !== "ok") throw new Error("API Error");

        loadingEl.style.display = 'none';
        lastUpdatedEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

        // Filter: Only high-value / potentially inflated pets (10M+ RAP)
        const highValuePets = rapData.data
            .filter(item => {
                const value = item.value || 0;
                return value > 10_000_000 && 
                       (item.category === "Pet" || item.category === "Huge" || item.category === "Titanic");
            })
            .sort((a, b) => b.value - a.value); // Highest first

        if (highValuePets.length === 0) {
            resultsEl.innerHTML = "<p>No high-value pets found at the moment.</p>";
            return;
        }

        highValuePets.forEach(item => {
            const name = item.configData.id || "Unknown Pet";
            const value = item.value.toLocaleString();
            const category = item.category || "Pet";

            // Try to get thumbnail from config (fallback image)
            const thumbnail = item.configData.thumbnail || 
                            item.configData.goldenThumbnail || "";

            const imageUrl = thumbnail 
                ? `https://ps99.biggamesapi.io/image/${thumbnail.split(':').pop()}`
                : "https://via.placeholder.com/80?text=Pet";

            const div = document.createElement('div');
            div.className = "rap-item";
            div.innerHTML = `
                <div class="item-info">
                    <img src="${imageUrl}" alt="${name}" class="pet-img" onerror="this.src='https://via.placeholder.com/80?text=Pet'">
                    <div>
                        <strong>${name}</strong>
                        <small>${category}</small>
                    </div>
                </div>
                <div class="value">${value} 💎</div>
            `;
            resultsEl.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        loadingEl.style.display = 'none';
        resultsEl.innerHTML = `<p style="color:red;text-align:center;">Failed to load data. Try again.</p>`;
    }
}

// Auto refresh every 60 seconds
document.addEventListener('DOMContentLoaded', () => {
    fetchLiveRAP();
    setInterval(fetchLiveRAP, 60000);
});