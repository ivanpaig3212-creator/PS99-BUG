// ==========================
// PS99 RAP Monitor Pro
// ==========================

const itemContainer = document.getElementById("itemContainer");
const searchInput = document.getElementById("search");

let items = [];

// Your Vercel API
const API_URL = "/api/rap";

function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
    if (num >= 1000) return (num / 1000).toFixed(2) + "K";
    return num;
}

function inflation(item) {
    if (!item.previous || item.previous === 0) return 0;
    return ((item.rap - item.previous) / item.previous) * 100;
}

function render(list) {

    itemContainer.innerHTML = "";

    document.getElementById("totalItems").textContent = list.length;

    let inflated = 0;

    list.forEach(item => {

        const percent = inflation(item);

        let badge = "Normal";
        let color = "badge-normal";

        if (percent >= 20) {
            badge = "Inflated";
            color = "badge-inflated";
            inflated++;
        }

        itemContainer.innerHTML += `
        <div class="col-md-4 col-lg-3 item-card">
            <div class="card">

                <img src="${item.image || "https://placehold.co/300x300?text=PS99"}">

                <div class="card-body">

                    <div class="item-name">
                        ${item.name}
                    </div>

                    <div class="text-secondary">
                        ${item.type || "Unknown"}
                    </div>

                    <div class="item-rap">
                        💎 ${formatNumber(item.rap)}
                    </div>

                    <div class="mt-2">
                        <span class="badge ${color}">
                            ${badge}
                        </span>
                    </div>

                    <div class="mt-2">
                        ${percent.toFixed(1)}%
                    </div>

                </div>

            </div>
        </div>
        `;
    });

    document.getElementById("inflatedItems").textContent = inflated;
    document.getElementById("updatedTime").textContent = new Date().toLocaleTimeString();
}

async function loadData() {

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        items = data.items;

        render(items);

    } catch (err) {

        console.error(err);

        itemContainer.innerHTML =
            "<h3 style='color:red'>Failed to load API.</h3>";

    }

}

// Search
searchInput.addEventListener("input", () => {

    const value = searchInput.value.toLowerCase();

    render(
        items.filter(item =>
            item.name.toLowerCase().includes(value)
        )
    );

});

// Load immediately
loadData();

// Refresh every 30 seconds
setInterval(loadData, 30000);