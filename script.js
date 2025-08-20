const OWNER_PASSWORD = "Snack@2@25"; // 🔑 Change this password

let cart = [];
let currentOrder = null;

// Item prices and stock
const itemData = {
    'maggi': { basePrice: 15, stock: 25 },
    'kurkure': { basePrice: 35, stock: 8 },
    'kitkat': { basePrice: 30, stock: 3 },
    'combo1': { basePrice: 45, stock: 999 },
    'combo2': { basePrice: 40, stock: 999 },
    'combo3': { basePrice: 60, stock: 999 },
    'ultimate': { basePrice: 75, stock: 999 }
};

// Color themes
const colorThemes = {
    'default': 'bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200',
    'coral': 'bg-gradient-to-br from-red-300 via-teal-300 to-cyan-300',
    'mint': 'bg-gradient-to-br from-green-300 via-yellow-300 to-orange-300',
    'rose': 'bg-gradient-to-br from-red-300 via-pink-300 to-rose-300',
    'lavender': 'bg-gradient-to-br from-purple-300 via-violet-300 to-indigo-300',
    'sky': 'bg-gradient-to-br from-sky-300 via-blue-300 to-green-300'
};

// Functions

function toggleOwnerPanel() {
    const panel = document.getElementById('ownerPanel');
    panel.classList.toggle('hidden');

    if (!panel.classList.contains('hidden')) {
        // Load current stock values into inputs
        document.getElementById('maggi-stock-input').value = itemData.maggi.stock;
        document.getElementById('kurkure-stock-input').value = itemData.kurkure.stock;
        document.getElementById('kitkat-stock-input').value = itemData.kitkat.stock;
    }
}

function checkPassword() {
    const enteredPassword = document.getElementById("ownerPassword").value;
    const message = document.getElementById("passwordMessage");

    if (enteredPassword === OWNER_PASSWORD) {
        // Enable stock inputs + buttons
        document.querySelectorAll("#stockControls input, #stockControls button")
            .forEach(el => el.disabled = false);

        message.textContent = "✅ Access granted!";
        message.classList.remove("text-red-500");
        message.classList.add("text-green-600");
    } else {
        message.textContent = "❌ Incorrect password!";
        message.classList.remove("text-green-600");
        message.classList.add("text-red-500");
    }
}

function updateStock(item) {
    const newStock = parseInt(document.getElementById(`${item}-stock-input`).value);
    if (newStock >= 0) {
        itemData[item].stock = newStock;
        localStorage.setItem(`stock-${item}`, newStock);
        updateStockDisplay(item);
        showNotification(`${item.charAt(0).toUpperCase() + item.slice(1)} stock updated to ${newStock}!`);

        // Auto close panel after update
        setTimeout(() => {
            toggleOwnerPanel();
        }, 1000);
    }
}

function updateStockDisplay(item) {
    const stockElement = document.getElementById(`${item}-stock`);
    const stock = itemData[item].stock;

    if (stockElement) {
        stockElement.textContent = `${stock} in stock`;
        const indicator = stockElement.parentElement;

        // Remove all stock classes
        indicator.classList.remove('stock-low', 'stock-medium', 'stock-high');

        // Add appropriate class based on stock level
        if (stock <= 5) {
            indicator.classList.add('stock-low');
        } else if (stock <= 15) {
            indicator.classList.add('stock-medium');
        } else {
            indicator.classList.add('stock-high');
        }
    }
}

function changeColorTheme(theme) {
    const body = document.getElementById('mainBody');

    // Remove all theme classes
    Object.values(colorThemes).forEach(themeClass => {
        body.classList.remove(...themeClass.split(' '));
    });

    // Add new theme
    body.classList.add(...colorThemes[theme].split(' '));

    // Update active color option
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    const selectedOption = document.querySelector(`.color-option[onclick*="'${theme}'"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    localStorage.setItem('colorTheme', theme);
}

function updatePrice(item) {
    const quantity = parseInt(document.getElementById(item + '-qty').textContent);
    const totalPrice = itemData[item].basePrice * quantity;
    document.getElementById(item + '-price').textContent = `₹${totalPrice}`;
}

function changeQuantity(item, change) {
    const qtyElement = document.getElementById(item + '-qty');
    let currentQty = parseInt(qtyElement.textContent);
    currentQty = Math.max(1, currentQty + change);
    qtyElement.textContent = currentQty;
    updatePrice(item);
}

function addToCart(itemName, price, itemId) {
    const quantity = parseInt(document.getElementById(itemId + '-qty').textContent);
    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            name: itemName,
            price: price,
            quantity: quantity
        });
    }

    updateCartDisplay();
    showNotification(`${itemName} added to cart!`);
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const totalAmount = document.getElementById('totalAmount');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-gray-500 text-center">Your cart is empty</p>';
        cartTotal.classList.add('hidden');
        checkoutBtn.classList.add('hidden');
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                <div>
                    <p class="font-semibold text-gray-800">${item.name}</p>
                    <p class="text-sm text-gray-600">₹${item.price} x ${item.quantity}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="removeFromCart('${item.name}')" class="text-red-500 hover:text-red-700">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        totalAmount.textContent = `₹${totalPrice}`;
        cartTotal.classList.remove('hidden');
        checkoutBtn.classList.remove('hidden');
    }
}

function removeFromCart(itemName) {
    cart = cart.filter(item => item.name !== itemName);
    updateCartDisplay();
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('translate-x-full');
}

function buyNow(itemName, basePrice, itemId) {
    const quantity = parseInt(document.getElementById(itemId + '-qty').textContent);
    const totalPrice = basePrice * quantity;
    currentOrder = {
        items: [{
            name: itemName,
            price: basePrice,
            quantity: quantity
        }],
        total: totalPrice
    };
    showOrderModal();
}

function checkoutCart() {
    if (cart.length === 0) return;

    currentOrder = {
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    showOrderModal();
    toggleCart();
}

function showOrderModal() {
    const modal = document.getElementById('orderModal');
    const orderSummary = document.getElementById('orderSummary');

    const summaryHTML = currentOrder.items.map(item =>
        `<div class="flex justify-between">
            <span>${item.name} x ${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
        </div>`
    ).join('') + `
        <div class="border-t pt-2 mt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>₹${currentOrder.total}</span>
        </div>
    `;

    orderSummary.innerHTML = summaryHTML;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Handle form submission
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('customerName').value;
    const hostel = document.getElementById('hostelName').value;
    const room = document.getElementById('roomNumber').value;
    const phone = document.getElementById('phoneNumber').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    // Prepare WhatsApp message using your exact format
    const itemsList = currentOrder.items.map(item => `${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`).join('%0A');
    const whatsappMessage = `Hello%0A%0A🛒 Order Details:%0A%0AName: ${name}%0AHostel: ${hostel}%0ARoom: ${room}%0APhone: ${phone}%0A%0A📦 Items:%0A${itemsList}%0A%0A💰 Total Amount: ₹${currentOrder.total}%0A💳 Payment Method: ${paymentMethod === 'online' ? 'Online Payment (PhonePe)' : 'Cash on Delivery'}%0A%0A⏰ Order Time: ${new Date().toLocaleString()}%0A%0APlease confirm this order. Thank you! 😊`;

    // Create WhatsApp URL using your exact format
    const whatsappURL = `https://api.whatsapp.com/send/?phone=916205574746&text=${whatsappMessage}&type=phone_number&app_absent=0`;

    // Clear cart if it was a cart checkout
    if (currentOrder.items.length > 1 || cart.some(item => currentOrder.items.some(orderItem => orderItem.name === item.name))) {
        cart = [];
        updateCartDisplay();
    }

    closeOrderModal();

    // Show confirmation and redirect to WhatsApp
    showNotification('🎉🎊 Your order has been confirmed! 🎊🎉 Redirecting to WhatsApp...');

    setTimeout(() => {
        window.open(whatsappURL, '_blank');
    }, 2000);

    // Reset form
    document.getElementById('orderForm').reset();
});

function toggleQRDisplay() {
    const onlinePayment = document.querySelector('input[name="paymentMethod"][value="online"]').checked;
    const qrContainer = document.getElementById('qr-code-container');
    const savedQR = localStorage.getItem('phonepe-qr');
    
    // Check if the QR container and saved QR exist
    if (onlinePayment && savedQR) {
        qrContainer.classList.remove('hidden');
        document.getElementById('qr-code-container').querySelector('img').src = savedQR;
    } else {
        qrContainer.classList.add('hidden');
    }
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved color theme
    const savedTheme = localStorage.getItem('colorTheme') || 'default';
    changeColorTheme(savedTheme);

    // Load saved stock values
    Object.keys(itemData).forEach(item => {
        const savedStock = localStorage.getItem(`stock-${item}`);
        if (savedStock !== null) {
            itemData[item].stock = parseInt(savedStock);
            updateStockDisplay(item);
        }
    });
    
    // Set up QR display based on initial state
    toggleQRDisplay();
});