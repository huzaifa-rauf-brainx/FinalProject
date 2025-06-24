let cart = [];
let mealCount = 4;

// Function to update meal count from localStorage
function updateMealCount() {
    const storedMealCount = localStorage.getItem('mealCount');
    if (storedMealCount) {
        mealCount = parseInt(storedMealCount);
        const remainingCountSpans = document.querySelectorAll('.remaining-count');
        remainingCountSpans.forEach(el => {
            el.textContent = mealCount;
        });
        updateCartUI();
    }
}

function addToCart(meal) {
    const totalCount = getTotalCartCount();

    if (totalCount < mealCount) {
        const mealWithId = {
            ...meal,
            id: crypto.randomUUID(),
            count: 1
        };
        cart.push(mealWithId);
        updateCartUI();
        saveCartToLocalStorage();
    } else {
        alert(`You can only select ${mealCount} meals.`);
    }
}

function removeMeal(meal) {
    const index = cart.findIndex(m => m.name === meal.name);
    if (index !== -1) {
        if (cart[index].count > 1) {
            cart[index].count -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCartUI();
        saveCartToLocalStorage();
    }
}

function getTotalCartCount() {
    return cart.reduce((total, m) => total + m.count, 0);
}

function saveCartToLocalStorage() {
    localStorage.setItem('cartData', JSON.stringify(cart));
    localStorage.setItem('cartSubtotal', calculateSubtotal().toFixed(2));
}

function calculateSubtotal() {
    return cart.reduce((sum, meal) => {
        return sum + (meal.price + (meal.additionalCharges || 0)) * meal.count;
    }, 0);
}

function updateCartUI() {
    const cartItemsContainer = document.querySelector('.cart-items-container');
    const cartTemplate = document.getElementById('cart-item-template');
    const cartNextBtn = document.querySelector('.cart-footer .cart-next-btn');
    const mobileNextBtn = document.querySelector('.mobile-cart .cart-next-btn');
    const remainingCountSpans = document.querySelectorAll('.remaining-count');
    const subtotalAmounts = document.querySelectorAll('.amount');
    const cartCounts = document.querySelectorAll('.count');
    const cartItemCountBadge = document.querySelector('.cart-item-count');
    const clearAllBtn = document.querySelector('.clear-all');

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
    }
    const orderSummary = document.getElementById('orderSummary');
    if (orderSummary) {
        orderSummary.style.display = getTotalCartCount() > 0 ? 'block' : 'none';
    }

    let subtotal = 0;
    let additionalCharges = 0;

    cart.forEach(meal => {
        if (cartItemsContainer && cartTemplate) {
            const cartItem = createCartItem(meal);
            cartItemsContainer.appendChild(cartItem);
            subtotal += (meal.price * meal.count);
            additionalCharges += (meal.additionalCharges || 0) * meal.count;
        }
    });

    const totalSubtotal = subtotal + additionalCharges;

    const mealsCountEl = document.querySelector('.meals-count');
    if (mealsCountEl) {
        const countText = getTotalCartCount() === 1 ? 'Meal' : 'Meals';
        const additionalChargesText = additionalCharges > 0 ? ` + $${additionalCharges.toFixed(2)}` : '';
        mealsCountEl.innerHTML = `
            <span>${getTotalCartCount()} ${countText}</span>
            <span>$${subtotal.toFixed(2)}${additionalChargesText}</span>
        `;
    }

    subtotalAmounts.forEach(el => el.textContent = totalSubtotal.toFixed(2));
    cartCounts.forEach(el => el.textContent = getTotalCartCount());
    if (cartItemCountBadge) {
        cartItemCountBadge.textContent = getTotalCartCount();
    }

    const remaining = mealCount - getTotalCartCount();
    remainingCountSpans.forEach(el => {
        el.textContent = remaining;
    });

    const remainingMessages = document.querySelectorAll('.meals-remaining');
    remainingMessages.forEach(el => {
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
    if (cartNextBtn) cartNextBtn.disabled = getTotalCartCount() !== mealCount;
    if (mobileNextBtn) mobileNextBtn.disabled = getTotalCartCount() !== mealCount;

    if (clearAllBtn) {
        clearAllBtn.style.display = getTotalCartCount() > 0 ? '' : 'none';
    }

    disableAddButtonsIfLimitReached();

    const mobileCartItemsContainer = document.querySelector('.mobile-cart-overlay .cart-items-container');
    mobileCartItemsContainer.innerHTML = '';

    cart.forEach(item => {
        const cartItemClone = createCartItem(item);
        mobileCartItemsContainer.appendChild(cartItemClone);
    });

    const mobileMealsCount = document.querySelector('#mobileOrderSummary .meals-count span:first-child');
    const mobileMealsTotal = document.querySelector('#mobileOrderSummary .meals-count span:last-child');
    const mobileSubtotalAmount = document.querySelector('#mobileOrderSummary .amount');

    if (mobileMealsCount) mobileMealsCount.textContent = `${getTotalCartCount()} Meals`;
    if (mobileMealsTotal) mobileMealsTotal.textContent = `$${subtotal.toFixed(2)}`;
    if (mobileSubtotalAmount) mobileSubtotalAmount.textContent = subtotal.toFixed(2);
}

function createCartItem(meal) {
    const template = document.getElementById('cart-item-template');
    const cartItem = template.content.cloneNode(true).querySelector('.cart-item');

    const img = cartItem.querySelector('.meal-thumb');
    img.src = meal.image;
    img.alt = meal.name;

    cartItem.querySelector('.meal-name').textContent = meal.name;

    if (meal.additionalCharges && meal.additionalCharges > 0) {
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

            applyButton.addEventListener('click', function() {
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
async function loadMeals() {
    try {
        const response = await fetch('meals.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const meals = await response.json();
        const container = document.getElementById('meals-grid');

        if (!container) {
            console.error('Meals grid container not found');
            return;
        }

        const template = document.getElementById('card-template');

        meals.forEach(meal => {
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

            mealClone.querySelector('.gluten-value').textContent = meal.gluten;
            mealClone.querySelector('.calories-value').textContent = meal.calories;
            mealClone.querySelector('.carbs-value').textContent = meal.carbs;
            mealClone.querySelector('.proteins-value').textContent = meal.proteins;

            const addBtn = mealClone.querySelector('.add-meal-btn');
            addBtn.addEventListener('click', () => {
                addToCart(meal);
                disableAddButtonsIfLimitReached();
            });

            container.appendChild(mealClone);
        });

    } catch (error) {
        console.error('Error loading meals:', error);
    }
    disableAddButtonsIfLimitReached();
}

function initializeCartItemEvents(cartItem, meal) {
    const removeBtn = cartItem.querySelector('.remove-item');
    const addBtn = cartItem.querySelector('.add-item');

    removeBtn.addEventListener('click', () => {
        removeMeal(meal);
        updateCartUI();
    });

    addBtn.addEventListener('click', () => {
        addToCart(meal);
        updateCartUI();
    });
}

// Checkout Section Functions
function initializeCheckout() {
    const selectedDate = localStorage.getItem('selectedDate');
    if (selectedDate) {
        document.getElementById('deliveryDate').value = selectedDate;
    }

    const cartData = JSON.parse(localStorage.getItem('cartData') || '[]');
    const mealsTotal = cartData.reduce((total, meal) => {
        return total + (meal.price + (meal.additionalCharges || 0)) * meal.count;
    }, 0);

    // Reset to original totals when initializing
    document.getElementById('mealsTotal').textContent = `$${mealsTotal.toFixed(2)}`;
    
    const shipping = 8.99;
    const tax = 10.99;
    const total = mealsTotal + shipping + tax;
    
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
    localStorage.setItem('originalMealsTotal', mealsTotal.toFixed(2));

    const selectedMealsContainer = document.getElementById('selectedMeals');
    selectedMealsContainer.innerHTML = '';

    const groupedMeals = {};

    cartData.forEach(meal => {
        if (!groupedMeals[meal.name]) {
            groupedMeals[meal.name] = { ...meal };
        } else {
            groupedMeals[meal.name].count += meal.count;
        }
    });

    const template = document.getElementById('selected-meal-template');

    Object.values(groupedMeals).forEach(meal => {
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

        selectedMealsContainer.appendChild(clone);
    });
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
        }
    });
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

function applyDiscount(discountPercent) {
    const originalMealsTotal = parseFloat(localStorage.getItem('originalMealsTotal'));
    const shipping = 8.99;
    const tax = 10.99;
    
    const discountAmount = (originalMealsTotal * discountPercent) / 100;
    const discountedMealsTotal = originalMealsTotal - discountAmount;
    
    document.getElementById('mealsTotal').textContent = `$${discountedMealsTotal.toFixed(2)}`;
    
    const total = discountedMealsTotal + shipping + tax;
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
    
    const promoContainer = document.querySelector('.order-summary-promo');
    promoContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span>Discount applied: ${discountPercent}% off</span>
            <a href="#" class="ms-3 text-decoration-underline" id="removePromo">Remove</a>
        </div>
    `;
    
    document.getElementById('removePromo').addEventListener('click', function(e) {
        e.preventDefault();
        removeDiscount();
    });
}

function removeDiscount() {
    const originalMealsTotal = parseFloat(localStorage.getItem('originalMealsTotal'));
    const shipping = 8.99;
    const tax = 10.99;
    
    document.getElementById('mealsTotal').textContent = `$${originalMealsTotal.toFixed(2)}`;
    
    const total = originalMealsTotal + shipping + tax;
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
    
    const promoContainer = document.querySelector('.order-summary-promo');
    promoContainer.innerHTML = `<a href="#" class="text-decoration-underline" id="addPromoLink">+ Add Promo Code</a>`;
    
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

            applyButton.addEventListener('click', function() {
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
}