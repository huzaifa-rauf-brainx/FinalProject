// Constants
const MEAL_LIMITS = {
    MIN: 4,
    MAX: 12,
    DEFAULT: 4
};

const PRICING = {
    SHIPPING: 8.99,
    TAX: 10.99
};

// Cached DOM Elements
const DOM_ELEMENTS = {
    // Cart Elements
    cartContainer: document.querySelector('.cart-container'),
    cartItemsContainer: document.querySelector('.cart-items-container'),
    cartNextBtn: document.querySelector('.cart-footer .cart-next-btn'),
    mobileNextBtn: document.querySelector('.mobile-cart .cart-next-btn'),
    clearAllBtn: document.querySelector('.clear-all'),
    cartItemCountBadge: document.querySelector('.cart-item-count'),
    
    // Meal Elements
    mealsGrid: document.getElementById('meals-grid'),
    mealsCount: document.querySelector('.meals-count'),
    remainingCountSpans: document.querySelectorAll('.remaining-count'),
    remainingMessages: document.querySelectorAll('.meals-remaining'),
    
    // Mobile Cart Elements
    mobileCartOverlay: document.querySelector('.mobile-cart-overlay'),
    mobileCart: document.querySelector('.mobile-cart'),
    mobileCartItemsContainer: document.querySelector('.mobile-cart-overlay .cart-items-container'),
    mobileCartTrigger: document.getElementById('mobile-cart-trigger'),
    closeCartButton: document.querySelector('.mobile-cart-overlay .close-cart'),
    
    // Order Summary Elements
    orderSummary: document.getElementById('orderSummary'),
    mealsTotal: document.getElementById('mealsTotal'),
    orderTotal: document.getElementById('orderTotal'),
    subtotalAmounts: document.querySelectorAll('.amount'),
    cartCounts: document.querySelectorAll('.count'),
    
    // Templates
    cardTemplate: document.getElementById('card-template'),
    cartItemTemplate: document.getElementById('cart-item-template'),
    
    // Checkout Elements
    checkoutSection: document.getElementById('checkout-section'),
    selectedMeals: document.getElementById('selectedMeals'),
    promoContainer: document.querySelector('.order-summary-promo'),
    discountField: document.querySelector('.order-discount'),
    discountTotal: document.getElementById('discountTotal'),
    
    // Delivery Elements
    deliveryDatesContainer: document.querySelector('.delivery-dates-container'),
    selectedDateSpan: document.querySelector('.selected-date'),
    cartSelectedDateSpan: document.querySelector('.cart-container .selected-date'),
    deliveryDate: document.getElementById('deliveryDate')
};

let cart = [];
let mealCount = MEAL_LIMITS.DEFAULT;

// Function to update meal count from localStorage
function updateMealCount() {
    const storedMealCount = localStorage.getItem('mealCount');
    if (storedMealCount) {
        mealCount = parseInt(storedMealCount);
        DOM_ELEMENTS.remainingCountSpans.forEach(el => {
            el.textContent = mealCount;
        });
        updateCartUI();
    }
}

function addToCart(meal) {
    if (!meal || typeof meal !== "object") {
        console.error("Invalid meal object");
        return false;
    }
    if (!meal.name || !meal.price) {
        console.error("Meal object missing required properties");
        return false;
    }

    const totalCount = getTotalCartCount();
    if (totalCount >= mealCount) {
        console.error("Cart is full");
        return false;
    }

    const mealWithId = {
        ...meal,
        id: crypto.randomUUID(),
        count: 1
    };
    cart.push(mealWithId);
    updateCartUI();
    saveCartToLocalStorage();
    return true;
}

function removeMeal(meal) {
    if (!meal || typeof meal !== "object") {
        console.error("Invalid meal object");
        return false;
    }
    if (!meal.name) {
        console.error("Meal object missing name property");
        return false;
    }

    const index = cart.findIndex(m => m.name === meal.name);
    if (index === -1) {
        console.error("Meal not found in cart");
        return false;
    }

    if (cart[index].count > 1) {
        cart[index].count -= 1;
    } else {
        cart.splice(index, 1);
    }
    updateCartUI();
    saveCartToLocalStorage();
    return true;
}

function getTotalCartCount() {
    return cart.reduce((total, m) => total + m.count, 0);
}

async function saveCartToLocalStorage() {
    try {
        if (!Array.isArray(cart)) {
            throw new Error("Invalid cart data");
        }

        // Validate cart items
        cart.forEach(item => {
            if (!item || typeof item !== 'object' || !item.name || typeof item.price !== 'number') {
                throw new Error(`Invalid cart item: ${JSON.stringify(item)}`);
            }
        });

        localStorage.setItem('cartData', JSON.stringify(cart));
        localStorage.setItem('cartSubtotal', calculateSubtotal().toFixed(2));
        return true;
    } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
        // Show user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-warning';
        errorMessage.textContent = 'Unable to save cart changes. Please check your browser settings.';
        document.querySelector('.cart-items-container')?.prepend(errorMessage);
        setTimeout(() => errorMessage.remove(), 5000);
        return false;
    }
}

function calculateSubtotal() {
    if (!Array.isArray(cart)) {
        console.error("Invalid cart data");
        return 0;
    }

    return cart.reduce((sum, meal) => {
        if (!meal || typeof meal !== "object" || !meal.price || !meal.count) {
            console.error("Invalid meal object in cart");
            return sum;
        }
        return sum + (meal.price + (meal.additionalCharges || 0)) * meal.count;
    }, 0);
}

function updateCartItemsContainer(container) {
    if (!container) return false;
    container.innerHTML = '';
    
    cart.forEach(meal => {
        const cartItem = createCartItem(meal);
        if (cartItem) {
            container.appendChild(cartItem);
        }
    });
    return true;
}

function updateOrderSummaryDisplay() {
    if (DOM_ELEMENTS.orderSummary) {
        DOM_ELEMENTS.orderSummary.style.display = getTotalCartCount() > 0 ? 'block' : 'none';
    }
}

function updateMealsCount() {
    if (!DOM_ELEMENTS.mealsCount) return;

    const totalCount = getTotalCartCount();
    const countText = totalCount === 1 ? 'Meal' : 'Meals';
    const subtotal = calculateSubtotal();
    const additionalCharges = cart.reduce((total, meal) => 
        total + (meal.additionalCharges || 0) * meal.count, 0);
    
    const additionalChargesText = additionalCharges > 0 ? ` + $${additionalCharges.toFixed(2)}` : '';
    DOM_ELEMENTS.mealsCount.innerHTML = `
        <span>${totalCount} ${countText}</span>
        <span>$${(subtotal - additionalCharges).toFixed(2)}${additionalChargesText}</span>
    `;
}

function updateCounterElements() {
    const totalSubtotal = calculateSubtotal();
    DOM_ELEMENTS.subtotalAmounts.forEach(el => el.textContent = totalSubtotal.toFixed(2));
    DOM_ELEMENTS.cartCounts.forEach(el => el.textContent = getTotalCartCount());
    if (DOM_ELEMENTS.cartItemCountBadge) {
        DOM_ELEMENTS.cartItemCountBadge.textContent = getTotalCartCount();
    }
}

function updateRemainingMeals() {
    const remaining = mealCount - getTotalCartCount();
    
    DOM_ELEMENTS.remainingCountSpans.forEach(el => {
        el.textContent = remaining;
    });

    DOM_ELEMENTS.remainingMessages.forEach(el => {
        el.style.display = 'block';
        if (getTotalCartCount() === 0) {
            el.textContent = `Please add total ${mealCount} items to continue.`;
        } else if (remaining === 0) {
            el.textContent = `Ready to go!`;
            el.style.fontFamily = "'Roboto-Bold', sans-serif";
        } else {
            el.textContent = `Please add ${remaining} more meal${remaining !== 1 ? 's' : ''}`;
        }
    });
}

function updateCartButtons() {
    const totalCount = getTotalCartCount();
    if (DOM_ELEMENTS.cartNextBtn) DOM_ELEMENTS.cartNextBtn.disabled = totalCount !== mealCount;
    if (DOM_ELEMENTS.mobileNextBtn) DOM_ELEMENTS.mobileNextBtn.disabled = totalCount !== mealCount;
    if (DOM_ELEMENTS.clearAllBtn) {
        DOM_ELEMENTS.clearAllBtn.style.display = totalCount > 0 ? '' : 'none';
    }
}

function updateMobileCartItems() {
    if (!DOM_ELEMENTS.mobileCartItemsContainer) return;
    
    DOM_ELEMENTS.mobileCartItemsContainer.innerHTML = '';
    cart.forEach(item => {
        const cartItemClone = createCartItem(item);
        if (cartItemClone) {
            DOM_ELEMENTS.mobileCartItemsContainer.appendChild(cartItemClone);
        }
    });
}

function updateMobileCartSummary() {
    const subtotal = calculateSubtotal();
    const mobileMealsCount = document.querySelector('#mobileOrderSummary .meals-count span:first-child');
    const mobileMealsTotal = document.querySelector('#mobileOrderSummary .meals-count span:last-child');
    const mobileSubtotalAmount = document.querySelector('#mobileOrderSummary .amount');

    if (mobileMealsCount) mobileMealsCount.textContent = `${getTotalCartCount()} Meals`;
    if (mobileMealsTotal) mobileMealsTotal.textContent = `$${subtotal.toFixed(2)}`;
    if (mobileSubtotalAmount) mobileSubtotalAmount.textContent = subtotal.toFixed(2);
}

function updateCartUI() {
    updateCartItemsContainer(DOM_ELEMENTS.cartItemsContainer);
    updateOrderSummaryDisplay();
    updateMealsCount();
    updateCounterElements();
    updateRemainingMeals();
    updateCartButtons();
    disableAddButtonsIfLimitReached();
    updateMobileCartItems();
    updateMobileCartSummary();
}

function createCartItem(meal) {
    if (!meal || typeof meal !== "object") {
        console.error("Invalid meal object");
        return null;
    }

    const template = document.getElementById('cart-item-template');
    if (!template) {
        console.error("Cart item template not found");
        return null;
    }

    const cartItem = template.content.cloneNode(true).querySelector('.cart-item');
    if (!cartItem) {
        console.error("Failed to create cart item from template");
        return null;
    }

    const img = cartItem.querySelector('.meal-thumb');
    if (img) {
        img.src = meal.image || '';
        img.alt = meal.name || '';
    }

    const nameElement = cartItem.querySelector('.meal-name');
    if (nameElement) {
        nameElement.textContent = meal.name || '';
    }

    if (meal.additionalCharges > 0) {
        cartItem.classList.add('special');
        if (meal.backgroundColor) {
            cartItem.style.backgroundColor = meal.backgroundColor;
        }

        const priceTag = cartItem.querySelector('.price-tag');
        if (priceTag) {
            priceTag.textContent = `+$${meal.additionalCharges.toFixed(2)}`;
            priceTag.classList.remove('d-none');
        }
    }

    initializeCartItemEvents(cartItem, meal);
    return cartItem;
}

document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".delivery-dates-container");
    const selectedDateSpan = document.querySelector(".selected-date");
    const cartSelectedDateSpan = document.querySelector(".cart-container .selected-date");

    updateMealCount();

    window.addEventListener('storage', function (e) {
        if (e.key === 'mealCount') {
            updateMealCount();
        }
    });

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'mealCount') {
            updateMealCount();
        }
    };

    function getNextMonday() {
        const today = new Date();
        const day = today.getDay();
        const diff = (8 - day) % 7 || 7;
        today.setDate(today.getDate() + diff);
        return today;
    }

    function formatDate(date) {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric"
        });
    }

    function createDateElement(dateStr, isSelected = false, isMostPopular = false) {
        const div = document.createElement("div");
        div.className = "date-option" + (isSelected ? " selected" : "");
        div.setAttribute("data-date", dateStr);

        const dateSpan = document.createElement("span");
        dateSpan.className = "date-text";
        dateSpan.textContent = dateStr;
        div.appendChild(dateSpan);

        if (isMostPopular) {
            const tag = document.createElement("span");
            tag.className = "most-popular-tag";
            tag.textContent = "Most Popular";
            div.appendChild(tag);
        }

        return div;
    }

    if (container) {
        const weekdays = [];
        let current = getNextMonday();

        while (weekdays.length < 10) {
            const day = current.getDay();
            if (day >= 1 && day <= 4) {
                weekdays.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }

        weekdays.forEach((date, index) => {
            const formatted = formatDate(date);
            const el = createDateElement(formatted, index === 0, index === 0);
            container.appendChild(el);
            if (index === 0) {
                selectedDateSpan.textContent = formatted;
                if (cartSelectedDateSpan) {
                    cartSelectedDateSpan.textContent = formatted;
                }
            }
        });

        container.addEventListener("click", function (e) {
            const option = e.target.closest(".date-option");
            if (!option) return;

            container.querySelectorAll(".date-option").forEach(el => el.classList.remove("selected"));
            option.classList.add("selected");

            const selectedDate = option.dataset.date;
            selectedDateSpan.textContent = selectedDate;
            if (cartSelectedDateSpan) {
                cartSelectedDateSpan.textContent = selectedDate;
            }

            container.querySelectorAll(".most-popular-tag").forEach(tag => {
                const parent = tag.closest(".date-option");
                if (parent === container.firstElementChild) {
                    tag.style.display = option === parent ? "" : "none";
                }
            });
        });
    }

    document.querySelectorAll('.clear-all').forEach(btn => {
        btn.addEventListener('click', () => {
            cart = [];
            updateCartUI();
            saveCartToLocalStorage();
            document.body.style.overflow = '';
        });
    });

    const daysNextBtn = document.querySelector('.delivery-date-section .next-btn');
    if (daysNextBtn) {
        daysNextBtn.addEventListener('click', function () {
            const selectedDate = document.querySelector(".date-option.selected").dataset.date;
            localStorage.setItem("selectedDate", selectedDate);
        });
    }

    document.getElementById('addPromoLink').addEventListener('click', function (e) {
        e.preventDefault();

        const promoContainer = document.querySelector('.order-summary-promo');
        if (promoContainer) {
            promoContainer.innerHTML = `
                <div class="promo-input-container">
                    <div class="d-flex w-100">
                        <input type="number" class="form-control flex-grow-1 me-2" id="promoInput" min="1" max="50" placeholder="Enter discount (1-50)">
                        <button class="btn btn-primary" id="applyPromo">Apply</button>
                    </div>
                    <small class="text-danger d-none mt-1" id="promoError">Please enter a value between 1 and 50</small>
                </div>
            `;

            const promoInput = document.getElementById('promoInput');
            const applyButton = document.getElementById('applyPromo');
            const errorText = document.getElementById('promoError');

            applyButton.addEventListener('click', function () {
                const discountValue = parseInt(promoInput.value);
                if (discountValue >= 1 && discountValue <= 50) {
                    errorText.classList.add('d-none');
                    applyDiscount(discountValue);
                } else {
                    errorText.classList.remove('d-none');
                }
            });
        }
    });

    updateCartUI();

    loadMeals();
});

function disableAddButtonsIfLimitReached() {
    const addButtons = document.querySelectorAll('.add-meal-btn');
    const reachedLimit = getTotalCartCount() >= mealCount;

    addButtons.forEach(btn => {
        btn.disabled = reachedLimit;
        btn.classList.toggle('disabled', reachedLimit);
    });
}

// Function to load and display meals
async function fetchMealsData() {
    try {
        const response = await fetch('meals.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Invalid meals data format');
        }
        return data;
    } catch (error) {
        console.error('Error fetching meals data:', error);
        throw error; // Re-throw to handle in loadMeals
    }
}

function createMealCard(meal, template) {
    const mealClone = template.content.cloneNode(true);
    const mealCard = mealClone.querySelector('.meal-card');

    if (meal.isSpecial) {
        mealCard.classList.add('special');
        if (meal.backgroundColor) {
            mealCard.style.backgroundColor = meal.backgroundColor;
        }
    }

    const img = mealClone.querySelector('.meal-img');
    img.src = meal.image;
    img.alt = meal.name;

    const priceTag = mealClone.querySelector('.price-tag');
    if (meal.isSpecial && meal.additionalCharges > 0) {
        priceTag.textContent = `+$${meal.additionalCharges.toFixed(2)}`;
        priceTag.classList.remove('d-none');
    } else {
        priceTag.classList.add('d-none');
    }

    mealClone.querySelector('.meal-name-main').textContent = meal.name;
    mealClone.querySelector('.meal-ingredients').textContent = meal.ingredients;

    setNutritionalInfo(mealClone, meal);
    setupAddButton(mealClone, meal);

    return mealClone;
}

function setNutritionalInfo(mealElement, meal) {
    mealElement.querySelector('.gluten-value').textContent = meal.gluten;
    mealElement.querySelector('.calories-value').textContent = meal.calories;
    mealElement.querySelector('.carbs-value').textContent = meal.carbs;
    mealElement.querySelector('.proteins-value').textContent = meal.proteins;
}

function setupAddButton(mealElement, meal) {
    const addBtn = mealElement.querySelector('.add-meal-btn');
    addBtn.addEventListener('click', () => {
        addToCart(meal);
        disableAddButtonsIfLimitReached();
    });
}

async function loadMeals() {
    try {
        const meals = await fetchMealsData();
        const container = document.getElementById('meals-grid');
        const template = document.getElementById('card-template');

        if (!container) {
            throw new Error('Meals grid container not found');
        }
        if (!template) {
            throw new Error('Meal card template not found');
        }

        container.innerHTML = ''; // Clear existing content
        meals.forEach(meal => {
            if (!meal || typeof meal !== 'object') {
                console.warn('Invalid meal data:', meal);
                return;
            }
            try {
                const mealCard = createMealCard(meal, template);
                container.appendChild(mealCard);
            } catch (cardError) {
                console.error('Error creating meal card:', cardError);
            }
        });

    } catch (error) {
        console.error('Error loading meals:', error);
        // Show user-friendly error message
        const container = document.getElementById('meals-grid');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Unable to load meals. Please try refreshing the page.
                </div>`;
        }
    }
    disableAddButtonsIfLimitReached();
}

function initializeCartItemEvents(cartItem, meal) {
    if (!cartItem || !(cartItem instanceof Element)) {
        console.error("Invalid cart item element");
        return false;
    }
    if (!meal || typeof meal !== "object") {
        console.error("Invalid meal object");
        return false;
    }

    const removeBtn = cartItem.querySelector('.remove-item');
    const addBtn = cartItem.querySelector('.add-item');

    if (!removeBtn || !addBtn) {
        console.error("Cart item buttons not found");
        return false;
    }

    removeBtn.addEventListener('click', () => {
        removeMeal(meal);
        updateCartUI();
    });

    addBtn.addEventListener('click', () => {
        addToCart(meal);
        updateCartUI();
    });

    return true;
}

// Checkout Section Functions
function setDeliveryDate() {
    const selectedDate = localStorage.getItem('selectedDate');
    if (selectedDate) {
        document.getElementById('deliveryDate').value = selectedDate;
    }
}

function calculateOrderTotals() {
    const cartData = JSON.parse(localStorage.getItem('cartData') || '[]');
    const mealsTotal = cartData.reduce((total, meal) => {
        return total + (meal.price + (meal.additionalCharges || 0)) * meal.count;
    }, 0);

    document.getElementById('mealsTotal').textContent = `$${mealsTotal.toFixed(2)}`;
    localStorage.setItem('originalMealsTotal', mealsTotal.toFixed(2));

    const shipping = 8.99;
    const tax = 10.99;
    const total = mealsTotal + shipping + tax;

    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
}

function groupMealsByName(cartData) {
    const groupedMeals = {};
    cartData.forEach(meal => {
        if (!groupedMeals[meal.name]) {
            groupedMeals[meal.name] = { ...meal };
        } else {
            groupedMeals[meal.name].count += meal.count;
        }
    });
    return groupedMeals;
}

function createSelectedMealElement(meal, template) {
    const clone = template.content.cloneNode(true);
    const mealItem = clone.querySelector('.meal-item');

    if (meal.additionalCharges > 0 && meal.backgroundColor) {
        mealItem.classList.add('special-meal');
        mealItem.style.backgroundColor = meal.backgroundColor;
    }

    clone.querySelector('.meal-quantity').textContent = meal.count;
    clone.querySelector('.meal-thumb-img').src = meal.image;
    clone.querySelector('.meal-thumb-img').alt = meal.name;
    clone.querySelector('.meal-name').textContent = meal.name;
    clone.querySelector('.meal-description').textContent = meal.ingredients || '';

    const priceTag = clone.querySelector('.special-price-tag');
    if (meal.additionalCharges > 0) {
        priceTag.textContent = `+$${meal.additionalCharges.toFixed(2)}`;
        priceTag.style.display = 'block';
    }

    return clone;
}

function displaySelectedMeals() {
    const selectedMealsContainer = document.getElementById('selectedMeals');
    selectedMealsContainer.innerHTML = '';

    const cartData = JSON.parse(localStorage.getItem('cartData') || '[]');
    const groupedMeals = groupMealsByName(cartData);
    const template = document.getElementById('selected-meal-template');

    Object.values(groupedMeals).forEach(meal => {
        const mealElement = createSelectedMealElement(meal, template);
        selectedMealsContainer.appendChild(mealElement);
    });
}

function initializeCheckout() {
    try {
        setDeliveryDate();
        calculateOrderTotals();
        displaySelectedMeals();
    } catch (error) {
        console.error('Error initializing checkout:', error);
        const checkoutSection = document.getElementById('checkout-section');
        if (checkoutSection) {
            checkoutSection.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    There was an error loading the checkout page. Please try again.
                </div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const checkoutSection = document.getElementById('checkout-section');
    if (checkoutSection) {
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (checkoutSection.style.display !== 'none') {
                        initializeCheckout();
                    }
                }
            });
        });
        observer.observe(checkoutSection, {
            attributes: true
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("checkout-form");
    const submitBtn = form.querySelector("button[type=submit]");
    const NAME_REGEX = /^[A-Za-z\s'-]+$/;
    const EMAIL_REGEX = /^[^@\s]+@[^@.\s]+\.[a-zA-Z]{2,}$/;
    const PHONE_REGEX = /^\d{11}$/;
    const ZIP_REGEX = /^\d{5}$/;

    // Initialize submit button as disabled
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";
    submitBtn.style.cursor = "not-allowed";

    function showError(input, message) {
        let errorDiv = document.getElementById(`${input.id}Error`);
        if (!errorDiv) {
            errorDiv = document.createElement("div");
            errorDiv.className = "invalid-feedback";
            errorDiv.id = `${input.id}Error`;
            input.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        updateSubmitButtonState();
    }

    function showSuccess(input) {
        let errorDiv = document.getElementById(`${input.id}Error`);
        if (errorDiv) errorDiv.textContent = "";
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
        updateSubmitButtonState();
    }

    function validateInput(input) {
        if (!input) return false;
        const value = input.value.trim();

        switch (input.id) {
            case "firstName":
            case "lastName":
            case "city":
            case "state":
                if (value === "") {
                    showError(input, `${input.id === "firstName" ? "First" : input.id === "lastName" ? "Last" : input.id.charAt(0).toUpperCase() + input.id.slice(1)} is required.`);
                    return false;
                }
                if (!NAME_REGEX.test(value)) {
                    showError(input, `${input.id.charAt(0).toUpperCase() + input.id.slice(1)} can only contain letters.`);
                    return false;
                }
                showSuccess(input);
                return true;

            case "fullName":
                if (value === "") {
                    showError(input, "Full name is required.");
                    return false;
                }
                if (!NAME_REGEX.test(value)) {
                    showError(input, "Full name can only contain letters.");
                    return false;
                }
                showSuccess(input);
                return true;

            case "addressLine1":
                if (value === "") {
                    showError(input, "Address Line 1 is required.");
                    return false;
                }
                showSuccess(input);
                return true;

            case "zip":
                if (value === "") {
                    showError(input, "Zip code is required.");
                    return false;
                }
                if (!ZIP_REGEX.test(value)) {
                    showError(input, "Zip code must be exactly 5 digits.");
                    return false;
                }
                showSuccess(input);
                return true;

            case "phone":
                if (value === "") {
                    showError(input, "Phone number is required.");
                    return false;
                }
                if (!PHONE_REGEX.test(value)) {
                    showError(input, "Phone number must be exactly 11 digits.");
                    return false;
                }
                showSuccess(input);
                return true;

            case "email":
                if (value === "") {
                    showError(input, "Email is required.");
                    return false;
                }
                if (!EMAIL_REGEX.test(value)) {
                    showError(input, "Please enter a valid email address.");
                    return false;
                }
                showSuccess(input);
                return true;

            default:
                return true;
        }
    }

    function isFormValid() {
        const requiredInputs = form.querySelectorAll("input[required]");
        return Array.from(requiredInputs).every(input => input.classList.contains("is-valid"));
    }

    function updateSubmitButtonState() {
        const allValid = isFormValid();
        submitBtn.disabled = !allValid;
        submitBtn.style.opacity = allValid ? "1" : "0.7";
        submitBtn.style.cursor = allValid ? "pointer" : "not-allowed";
    }

    form.addEventListener("input", (e) => {
        if (e.target.tagName === "INPUT") {
            validateInput(e.target);
        }
    });

    form.addEventListener("blur", (e) => {
        if (e.target.tagName === "INPUT") {
            validateInput(e.target);
        }
    }, true);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const requiredInputs = form.querySelectorAll("input[required]");
        let allValid = true;

        requiredInputs.forEach(input => {
            const valid = validateInput(input);
            if (!valid) allValid = false;
        });

        if (allValid) {
            alert("Order placed successfully!");
            // form reset
            form.reset();
            const inputs = form.querySelectorAll("input");
            inputs.forEach(input => {
                input.classList.remove("is-valid", "is-invalid"); // or any other classes you're using
            });
            // clear localStorage
            localStorage.removeItem('mealCount');
            localStorage.removeItem('planPrice');
            localStorage.removeItem('perMealPrice');
            localStorage.removeItem('selectedDate');
            localStorage.removeItem('cartData');
            localStorage.removeItem('cartSubtotal');
            localStorage.removeItem('originalMealsTotal');

            // reset checkout section
            const checkoutSection = document.getElementById('checkout-section');
            if (checkoutSection) {
                const orderSummary = document.getElementById('orderSummary');
                if (orderSummary) {
                    orderSummary.style.display = 'none';
                }
                const selectedMealsContainer = document.getElementById('selectedMeals');
                if (selectedMealsContainer) {
                    selectedMealsContainer.innerHTML = '';
                }
            }
            // reset order summary
            const orderTotalEl = document.getElementById('orderTotal');
            if (orderTotalEl) {
                orderTotalEl.textContent = '$0.00';
            }
            const mealsTotalEl = document.getElementById('mealsTotal');
            if (mealsTotalEl) {
                mealsTotalEl.textContent = '$0.00';
            }
            const deliveryDateInput = document.getElementById('deliveryDate');
            if (deliveryDateInput) {
                deliveryDateInput.value = '';
            }
            const shippingEl = document.getElementById('shippingTotal');
            if (shippingEl) {
                shippingEl.textContent = '$0.00';
            }
            const taxEl = document.getElementById('taxTotal');
            if (taxEl) {
                taxEl.textContent = '$0.00';
            }
        }
    });

    const zipChangeLink = document.querySelector('.zip-change-opt');
    const zipInput = document.getElementById('zip');

    if (zipChangeLink && zipInput) {
        zipChangeLink.addEventListener('click', (e) => {
            e.preventDefault();
            zipInput.value = '';
            zipInput.classList.remove('is-valid', 'is-invalid');
            const errorDiv = document.getElementById('zipError');
            if (errorDiv) {
                errorDiv.remove();
            }
            zipInput.focus();
            updateSubmitButtonState();
        });
    }

    const commonContent = `
    <p>The majority of our meals are single serving and meant to feed an average adult. We also offer multi-serve proteins and sides, which are designed to feed multiple people for extra mealtime flexibility. These delicious, ready-to-heat options can help you bulk up existing meals, simplify home cooking, or even build an entire meal—the choice is yours!
    </p>
    <p>Our 6-meal plan is perfect for a person looking for 6 dinners (or lunches!) a week. On average, our meals weigh in at about 13 ounces and range from 300 to 650 calories. If you have a larger household, we do offer a 12 meal per week subscription (it's perfect for couples or a family of 4 looking for 3 meals per week). Plus, you can always order multiple subscriptions.</p>
  `;
    const faqItems = [
        { id: 'One', title: 'How many servings are your meals?' },
        { id: 'Two', title: 'Do you accommodate dietary preferences?' },
        { id: 'Three', title: 'How long do the meals last?' },
        { id: 'Four', title: 'How do I heat up my meals?' },
        { id: 'Five', title: 'How does shipping work?' },
        { id: 'Six', title: 'How does the subscription work?' },
        { id: 'Seven', title: 'How does shipping work?' },
        { id: 'Eight', title: 'How does the subscription work?', extraClass: 'mb-5' }
    ];
    function renderAccordion(containerId, items) {
        const container = document.getElementById(containerId);
        const tpl = document.getElementById('accordion-template').innerHTML;
        items.forEach(item => {
            const html = tpl
                .replace(/{{parentId}}/g, containerId)
                .replace(/{{id}}/g, item.id)
                .replace(/{{title}}/g, item.title)
                .replace(/{{content}}/g, commonContent)
                .replace(/{{extraClass}}/g, item.extraClass || '');
            container.insertAdjacentHTML('beforeend', html);
        });
    }
    renderAccordion('accordionExample1', faqItems);
    renderAccordion('accordionExample2', faqItems);
});

const mobileCartTrigger = document.getElementById('mobile-cart-trigger');
const mobileCartOverlay = document.querySelector('.mobile-cart-overlay');
const mobileCart = document.querySelector('.mobile-cart');
const closeCartButton = document.querySelector('.mobile-cart-overlay .close-cart');

mobileCartTrigger.addEventListener('click', () => {
    const isOpen = mobileCartOverlay.classList.contains('show');
    if (isOpen) {
        mobileCartOverlay.classList.remove('show');
        document.body.style.overflow = '';
    } else {
        mobileCartOverlay.classList.add('show');
        document.body.style.overflow = '';

        const selectedDate = localStorage.getItem('selectedDate');
        if (selectedDate) {
            const mobileCartDate = mobileCartOverlay.querySelector('.selected-date');
            if (mobileCartDate) {
                mobileCartDate.textContent = selectedDate;
            }
        }
    }
});

closeCartButton.addEventListener('click', () => {
    mobileCartOverlay.classList.remove('show');
    document.body.style.overflow = '';
});

async function applyDiscount(discountPercent) {
    try {
        if (typeof discountPercent !== 'number' || discountPercent < 1 || discountPercent > 50) {
            throw new Error('Invalid discount percentage');
        }

        const originalMealsTotal = parseFloat(localStorage.getItem('originalMealsTotal'));
        if (isNaN(originalMealsTotal)) {
            throw new Error('Invalid meals total');
        }

        const shipping = 8.99;
        const tax = 10.99;

        const discountAmount = (originalMealsTotal * discountPercent) / 100;
        const discountedMealsTotal = originalMealsTotal - discountAmount;

        // Update DOM elements
        const elements = {
            mealsTotal: document.getElementById('mealsTotal'),
            discountField: document.querySelector('.order-discount'),
            discountTotal: document.getElementById('discountTotal'),
            orderTotal: document.getElementById('orderTotal'),
            promoContainer: document.querySelector('.order-summary-promo')
        };

        // Validate required elements exist
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) throw new Error(`Required element not found: ${key}`);
        });

        elements.mealsTotal.textContent = `$${originalMealsTotal.toFixed(2)}`;
        elements.discountField.style.setProperty('display', 'flex', 'important');
        elements.discountTotal.textContent = `-$${discountAmount.toFixed(2)}`;

        const total = discountedMealsTotal + shipping + tax;
        elements.orderTotal.textContent = `$${total.toFixed(2)}`;

        // Update promo container
        elements.promoContainer.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>Discount applied: ${discountPercent}% off</span>
                <a href="#" class="ms-3 text-decoration-underline" id="removePromo">Remove</a>
            </div>
        `;

        document.getElementById('removePromo')?.addEventListener('click', function (e) {
            e.preventDefault();
            removeDiscount();
        });

    } catch (error) {
        console.error('Error applying discount:', error);
        // Show user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger';
        errorMessage.textContent = 'Unable to apply discount. Please try again.';
        document.querySelector('.order-summary-promo')?.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 5000);
    }
}

function removeDiscount() {
    const originalMealsTotal = parseFloat(localStorage.getItem('originalMealsTotal'));
    const shipping = 8.99;
    const tax = 10.99;

    document.getElementById('mealsTotal').textContent = `$${originalMealsTotal.toFixed(2)}`;

    const discountField = document.querySelector('.order-discount');
    if (discountField) {
        discountField.style.setProperty('display', 'none', 'important');
        document.getElementById('discountTotal').textContent = '$0.00';
    }

    const total = originalMealsTotal + shipping + tax;
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;

    const promoContainer = document.querySelector('.order-summary-promo');
    promoContainer.innerHTML = `<a href="#" class="text-decoration-underline" id="addPromoLink">+ Add Promo Code</a>`;

    document.getElementById('addPromoLink').addEventListener('click', function (e) {
        e.preventDefault();
        showPromoInput();
    });
}

function showPromoInput() {
    const promoContainer = document.querySelector('.order-summary-promo');
    if (promoContainer) {
        promoContainer.innerHTML = `
            <div class="promo-input-container">
                <div class="d-flex w-100">
                    <input type="number" class="form-control flex-grow-1 me-2" id="promoInput" min="1" max="50" placeholder="Enter discount (1-50)">
                    <button class="btn btn-primary" id="applyPromo">Apply</button>
                </div>
                <small class="text-danger d-none mt-1" id="promoError">Please enter a value between 1 and 50</small>
            </div>
        `;

        const promoInput = document.getElementById('promoInput');
        const applyButton = document.getElementById('applyPromo');
        const errorText = document.getElementById('promoError');

        applyButton.addEventListener('click', function () {
            const discountValue = parseInt(promoInput.value);
            if (discountValue >= 1 && discountValue <= 50) {
                errorText.classList.add('d-none');
                applyDiscount(discountValue);
            } else {
                errorText.classList.remove('d-none');
            }
        });
    }
}