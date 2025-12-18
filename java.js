let slideIndex = 0;
let autoTimer;

// start slideshow when page loads
document.addEventListener("DOMContentLoaded", () => {
    showSlide(slideIndex);
    startAutoSlide();
});

// SHOW SLIDE
function showSlide(n) {
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");

    if (slides.length === 0) return; // safety

    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }

    slides[slideIndex].style.display = "block";
    dots[slideIndex].classList.add("active");
}

// NEXT / PREV
function plusSlides(n) {
    slideIndex += n;
    showSlide(slideIndex);
    resetAutoSlide();
}

function currentSlide(n) {
    slideIndex = n - 1;
    showSlide(slideIndex);
    resetAutoSlide();
}

// AUTO SLIDE
function startAutoSlide() {
    autoTimer = setInterval(() => {
        slideIndex++;
        showSlide(slideIndex);
    }, 5000);
}

function resetAutoSlide() {
    clearInterval(autoTimer);
    startAutoSlide();
}

// ===== HAMBURGER MENU =====
const navLinks = document.querySelector(".nav-links");
const hamburger = document.querySelector(".hamburger");
const closeBtn = document.querySelector(".close-menu");

function openMenu() {
    navLinks.classList.add("active");
    hamburger.style.display = "none";
    closeBtn.classList.remove("hide");
    closeBtn.classList.add("show");
}

function closeMenu() {
    navLinks.classList.remove("active");
    closeBtn.classList.remove("show");
    closeBtn.classList.add("hide");

    setTimeout(() => {
        hamburger.style.display = "block";
        closeBtn.style.display = "none";
    }, 500);
}

// ===== SORT DROPDOWN =====
function toggleSort() {
    document.getElementById("sortDropdown").classList.toggle("show");
}

window.addEventListener("click", function (e) {
    const btn = document.querySelector(".sort-btn");
    const dropdown = document.getElementById("sortDropdown");

    if (!btn || !dropdown) return;

    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("show");
    }
});




function toggleBrowse() {
    document.getElementById("browseDropdown").classList.toggle("show");
}

/* close when clicking outside */
window.addEventListener("click", function (e) {
    const btn = document.querySelector(".browse-btn");
    const dropdown = document.getElementById("browseDropdown");

    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("show");
    }
});



/* ===================== QUANTITY CONTROL ===================== */
function changeQty(amount) {
    const qtyInput = document.getElementById("quantity");
    let value = parseInt(qtyInput.value);
    value += amount;
    if (value < 1) value = 1;
    qtyInput.value = value;
}



/* ===================== CART SYSTEM (Persistent Across Pages) ===================== */

// Load cart from localStorage or start empty
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* ----------------- UPDATE CART ICON ----------------- */
function updateCartIcon() {
    const cartCountIcon = document.getElementById("cart-count");
    if (!cartCountIcon) return;

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountIcon.innerText = totalQty;
    cartCountIcon.style.display = totalQty > 0 ? "flex" : "none";

    // Update summary if on cart page
    const cartSummaryCount = document.getElementById("cart-count-summary");
    const cartSummaryTotal = document.getElementById("cart-total-price");

    if (cartSummaryCount && cartSummaryTotal) {
        cartSummaryCount.innerText = totalQty;
        const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
        cartSummaryTotal.innerText = totalPrice.toFixed(2);
    }
}

/* ----------------- ADD TO CART (Product Page) ----------------- */
function addToCart() {
    const qty = parseInt(document.getElementById("quantity").value);
    const remark = document.querySelector(".remark-box textarea")?.value || "";
    const productName = document.querySelector(".product-title")?.innerText;
    const productPrice = parseFloat(document.querySelector(".product-price")?.innerText.replace("RM ", ""));
    const productImage = document.querySelector(".product-image img")?.src;

    if (!productName || !productPrice || !productImage) return;

    const productId = productName + "-" + remark;

    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex !== -1) {
        cart[existingIndex].qty += qty;
    } else {
        cart.push({
            id: productId,
            name: productName,
            qty: qty,
            remark: remark,
            price: productPrice,
            image: productImage
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartIcon();
    alert("Added to cart!");
}

/* ----------------- REMOVE ITEM ----------------- */
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartPage();
    updateCartIcon();
}

/* ----------------- CHANGE QUANTITY ----------------- */
function changeCartQty(id, delta) {
    const index = cart.findIndex(item => item.id === id);
    if (index === -1) return;

    cart[index].qty += delta;
    if (cart[index].qty < 1) cart[index].qty = 1;

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartPage();
    updateCartIcon();
}

/* ----------------- RENDER CART PAGE ----------------- */
function updateCartPage() {
    const cartContainer = document.getElementById("cart-container");
    if (!cartContainer) return;

    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    cart.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");

        itemDiv.innerHTML = `
            <div class="cart-item-left">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>Price: RM ${(item.price * item.qty).toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" data-id="${item.id}" data-change="-1">−</button>
                        <input type="text" value="${item.qty}" readonly>
                        <button class="qty-btn" data-id="${item.id}" data-change="1">+</button>
                    </div>
                    <p>Remark: ${item.remark ? item.remark : "None"}</p>
                </div>
            </div>
            <div class="cart-item-right" data-id="${item.id}">🗑</div>
        `;

        cartContainer.appendChild(itemDiv);
    });

    // Add event listeners for quantity buttons
    const qtyButtons = document.querySelectorAll(".qty-btn");
    qtyButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const delta = parseInt(btn.dataset.change);
            changeCartQty(id, delta);
        });
    });

    // Add event listeners for remove buttons
    const removeButtons = document.querySelectorAll(".cart-item-right");
    removeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            removeFromCart(id);
        });
    });

    updateCartIcon();
}

/* ----------------- QUANTITY CONTROL ON PRODUCT PAGE ----------------- */
function changeQty(amount) {
    const qtyInput = document.getElementById("quantity");
    let value = parseInt(qtyInput.value);
    value += amount;
    if (value < 1) value = 1;
    qtyInput.value = value;
}

/* ----------------- RUN ON PAGE LOAD ----------------- */
document.addEventListener("DOMContentLoaded", () => {
    updateCartIcon();
    updateCartPage();
});




/* ===================== ACCORDION ===================== */
function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector(".icon");

    if (content.style.display === "block") {
        content.style.display = "none";
        icon.innerText = "+";
    } else {
        content.style.display = "block";
        icon.innerText = "−";
    }
}

// --------------------
// Call updateCartPage on page load if cart page exists
document.addEventListener("DOMContentLoaded", () => {
    updateCartPage();
});







// WhatsApp number of the cafe (include country code, e.g., Malaysia +60)
const cafeWhatsAppNumber = "60149019268"; 

function generateWhatsAppLink() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return "#";
    }

    let message = "Hello! I would like to place an order:\n\n";

    cart.forEach(item => {
        message += `• ${item.name}\n  Quantity: ${item.qty}\n  Remark: ${item.remark ? item.remark : "None"}\n  Price: RM ${(item.price * item.qty).toFixed(2)}\n\n`;
    });

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    message += `Total Price: RM ${totalPrice.toFixed(2)}`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // WhatsApp link
    return `https://wa.me/${cafeWhatsAppNumber}?text=${encodedMessage}`;
}

// Assign link to button
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("submit-order-btn");
    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const link = generateWhatsAppLink();
            if (link !== "#") {
                window.open(link, "_blank");
            }
        });
    }
});





function toggleAccordion(header) {
    const item = header.parentElement;

    // Close other accordions (optional)
    document.querySelectorAll('.accordion-item').forEach(acc => {
        if (acc !== item) acc.classList.remove('active');
    });

    // Toggle current
    item.classList.toggle('active');
}

