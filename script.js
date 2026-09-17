// ========================================
// FRANCO - POINT OF SALE SYSTEM
// JavaScript Version
// ========================================

const TAX_RATE = 0.12;

// ========================================
// PRODUCTS
// ========================================

const products = [
    {
        name: "Burger",
        price: 75.00
    },
    {
        name: "French Fries",
        price: 50.00
    },
    {
        name: "Pizza",
        price: 250.00
    },
    {
        name: "Fried Chicken",
        price: 120.00
    },
    {
        name: "Soft Drink",
        price: 35.00
    },
    {
        name: "Coffee",
        price: 60.00
    },
    {
        name: "Ice Cream",
        price: 45.00
    }
];

// ========================================
// CART
// ========================================

let cart = [];

// ========================================
// ELEMENTS
// ========================================

const productSelect = document.getElementById("productSelect");
const quantityInput = document.getElementById("quantity");

const cartBody = document.getElementById("cartBody");

const subtotalLabel = document.getElementById("subtotal");
const taxLabel = document.getElementById("tax");
const totalLabel = document.getElementById("total");
const changeLabel = document.getElementById("change");

const paymentInput = document.getElementById("payment");

// ========================================
// MONEY FORMAT
// ========================================

function money(amount) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(amount);
}

// ========================================
// LOAD PRODUCTS
// ========================================

function loadProducts() {

    productSelect.innerHTML = "";

    products.forEach((product, index) => {

        const option = document.createElement("option");

        option.value = index;

        option.textContent =
            `${product.name} - ${money(product.price)}`;

        productSelect.appendChild(option);
    });
}

// ========================================
// ADD PRODUCT
// ========================================

function addProduct() {

    const productIndex =
        Number(productSelect.value);

    const quantity =
        Number(quantityInput.value);

    if (!Number.isInteger(quantity) ||
        quantity < 1) {

        alert("Please enter a valid quantity.");

        return;
    }

    const product =
        products[productIndex];

    if (!product) {
        return;
    }

    // Check if product already exists
    const existing =
        cart.find(item =>
            item.name === product.name
        );

    if (existing) {

        existing.quantity += quantity;

    } else {

        cart.push({
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }

    renderCart();
    updateTotals();
}

// ========================================
// RENDER CART
// ========================================

function renderCart() {

    cartBody.innerHTML = "";

    cart.forEach((item, index) => {

        const row =
            document.createElement("tr");

        const itemTotal =
            item.price * item.quantity;

        row.innerHTML = `
            <td>${item.name}</td>

            <td>${money(item.price)}</td>

            <td>${item.quantity}</td>

            <td>${money(itemTotal)}</td>

            <td>
                <button onclick="removeProduct(${index})">
                    Remove
                </button>
            </td>
        `;

        cartBody.appendChild(row);
    });
}

// ========================================
// REMOVE PRODUCT
// ========================================

function removeProduct(index) {

    if (index < 0 || index >= cart.length) {
        return;
    }

    cart.splice(index, 1);

    renderCart();
    updateTotals();
}

// ========================================
// CLEAR CART
// ========================================

function clearCart() {

    if (cart.length === 0) {
        return;
    }

    const confirmed =
        confirm("Are you sure you want to clear the cart?");

    if (!confirmed) {
        return;
    }

    cart = [];

    paymentInput.value = "";

    renderCart();
    updateTotals();
}

// ========================================
// CALCULATE SUBTOTAL
// ========================================

function getSubtotal() {

    return cart.reduce(
        (sum, item) =>
            sum + (item.price * item.quantity),
        0
    );
}

// ========================================
// GET TOTAL
// ========================================

function getTotal() {

    const subtotal =
        getSubtotal();

    const tax =
        subtotal * TAX_RATE;

    return subtotal + tax;
}

// ========================================
// UPDATE TOTALS
// ========================================

function updateTotals() {

    const subtotal =
        getSubtotal();

    const tax =
        subtotal * TAX_RATE;

    const total =
        subtotal + tax;

    subtotalLabel.textContent =
        money(subtotal);

    taxLabel.textContent =
        money(tax);

    totalLabel.textContent =
        money(total);

    calculateChange();
}

// ========================================
// CALCULATE CHANGE
// ========================================

function calculateChange() {

    const payment =
        Number(paymentInput.value);

    const total =
        getTotal();

    if (
        paymentInput.value.trim() === "" ||
        isNaN(payment)
    ) {

        changeLabel.textContent =
            money(0);

        changeLabel.className =
            "normal";

        return;
    }

    const change =
        payment - total;

    if (change < 0) {

        changeLabel.textContent =
            "Insufficient";

        changeLabel.className =
            "error";

    } else {

        changeLabel.textContent =
            money(change);

        changeLabel.className =
            "normal";
    }
}

// ========================================
// CHECKOUT
// ========================================

function checkout() {

    if (cart.length === 0) {

        alert("The cart is empty.");

        return;
    }

    const payment =
        Number(paymentInput.value);

    if (
        paymentInput.value.trim() === "" ||
        isNaN(payment)
    ) {

        alert("Please enter a valid payment amount.");

        return;
    }

    if (payment < 0) {

        alert("Payment cannot be negative.");

        return;
    }

    const subtotal =
        getSubtotal();

    const tax =
        subtotal * TAX_RATE;

    const total =
        subtotal + tax;

    if (payment < total) {

        alert(
            "Insufficient payment.\n\n" +
            "Required: " + money(total) + "\n" +
            "Paid: " + money(payment)
        );

        return;
    }

    const change =
        payment - total;

    // ====================================
    // RECEIPT
    // ====================================

    let receipt =
        "========== RECEIPT ==========\n\n";

    cart.forEach(item => {

        const itemTotal =
            item.price * item.quantity;

        receipt +=
            `${item.name} x ${item.quantity} = ${money(itemTotal)}\n`;
    });

    receipt +=
        "\n-----------------------------\n";

    receipt +=
        `Subtotal: ${money(subtotal)}\n`;

    receipt +=
        `Tax (12%): ${money(tax)}\n`;

    receipt +=
        `Total: ${money(total)}\n`;

    receipt +=
        `Payment: ${money(payment)}\n`;

    receipt +=
        `Change: ${money(change)}\n`;

    receipt +=
        "\nThank you for your purchase!";

    alert(receipt);

    // ====================================
    // RESET TRANSACTION
    // ====================================

    cart = [];

    paymentInput.value = "";

    renderCart();
    updateTotals();
}

// ========================================
// EVENT LISTENERS
// ========================================

document
    .getElementById("addButton")
    .addEventListener("click", addProduct);

document
    .getElementById("clearButton")
    .addEventListener("click", clearCart);

document
    .getElementById("checkoutButton")
    .addEventListener("click", checkout);

document
    .getElementById("payment")
    .addEventListener("input", calculateChange);

// ========================================
// START APPLICATION
// ========================================

loadProducts();

renderCart();

updateTotals();