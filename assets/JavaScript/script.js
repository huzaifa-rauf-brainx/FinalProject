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
    const existingMeal = cart.find(m => m.name === meal.name);
    const totalCount = getTotalCartCount();

    if (totalCount < mealCount) {
        if (existingMeal) {
            existingMeal.count += 1;
        } else {
            cart.push({ ...meal, count: 1 });
        }
        updateCartUI();
        saveCartToLocalStorage();
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

    // Update the message for remaining meals
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

        // Show price tag
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

    const clearAllBtn = document.querySelector('.clear-all');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            cart = [];
            updateCartUI();
        });
    }

    const daysNextBtn = document.querySelector('.delivery-date-section .next-btn');
    if (daysNextBtn) {
        daysNextBtn.addEventListener('click', function () {
            const selectedDate = document.querySelector(".date-option.selected").dataset.date;
            localStorage.setItem("selectedDate", selectedDate);
            currentStep = 2;
            updateBreadcrumbUI(currentStep);
            showStep(currentStep);
        });
    }

    document.getElementById('addPromoLink').addEventListener('click', function (e) {
        e.preventDefault();

        const promoContainer = document.querySelector('.order-summary-promo');
        if (promoContainer) {
            promoContainer.innerHTML = `
                <input type="text" class="form-control" placeholder="Enter Promo Code" >
            `;
        }
    });


    updateCartUI();

    loadMeals();
});

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

        container.innerHTML = '';

        meals.forEach(meal => {
            const mealCol = document.createElement('div');
            mealCol.className = 'col-12 col-md-6 col-lg-4 col-xl-3';

            const mealCard = document.createElement('div');
            mealCard.className = 'meal-card';
            if (meal.isSpecial) {
                mealCard.classList.add('special');
            }

            const imageContainer = document.createElement('div');
            imageContainer.className = 'meal-image-container';

            const img = document.createElement('img');
            img.className = 'meal-img';
            img.src = meal.image;
            img.alt = meal.name;

            imageContainer.appendChild(img);

            if (meal.isSpecial && meal.additionalCharges > 0) {
                const priceTag = document.createElement('div');
                priceTag.className = 'price-tag';
                priceTag.textContent = `+$${meal.additionalCharges.toFixed(2)}`;
                imageContainer.appendChild(priceTag);
            }

            imageContainer.appendChild(img);

            const mealInfo = document.createElement('div');
            mealInfo.className = 'meal-info';

            const name = document.createElement('h3');
            name.className = 'meal-name';
            name.textContent = meal.name;

            const ingredients = document.createElement('p');
            ingredients.className = 'meal-ingredients';
            ingredients.textContent = meal.ingredients;

            const footer = document.createElement('div');
            footer.className = 'meal-footer';

            const stats = document.createElement('div');
            stats.className = 'meal-stats mb-2 d-flex justify-content-between';

            const statsRow = document.createElement('div');
            statsRow.className = 'd-flex justify-content-between';

            const glutenStats = document.createElement('div');
            glutenStats.className = 'gluten-stats';
            glutenStats.innerHTML = `
                <div class="stat-item">
                    <div class="stat-label">Gluten</div>
                </div>
                <div>
                    <div class="stat-value gluten-value">${meal.gluten}</div>
                </div>
            `;

            const caloriesStats = document.createElement('div');
            caloriesStats.className = 'calories-stats';
            caloriesStats.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value calories-value">${meal.calories}</div>
                </div>
                <div class="stat-label">Cals</div>
            `;

            const carbsStats = document.createElement('div');
            carbsStats.className = 'carbs-stats';
            carbsStats.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value carbs-value">${meal.carbs}</div>
                </div>
                <div class="stat-label">Carbs</div>
            `;

            const proteinsStats = document.createElement('div');
            proteinsStats.className = 'proteins-stats';
            proteinsStats.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value proteins-value">${meal.proteins}</div>
                </div>
                <div class="stat-label">Proteins</div>
            `;

            statsRow.appendChild(glutenStats);
            statsRow.appendChild(caloriesStats);
            statsRow.appendChild(carbsStats);
            statsRow.appendChild(proteinsStats);

            const addBtnContainer = document.createElement('div');
            addBtnContainer.className = 'ms-auto add-btn-wrapper';
            const addBtn = document.createElement('button');
            addBtn.className = 'add-meal-btn';
            addBtn.textContent = '+ Add';
            addBtn.addEventListener('click', () => addToCart(meal));
            addBtnContainer.appendChild(addBtn);

            stats.appendChild(statsRow);
            stats.appendChild(addBtnContainer);
            footer.appendChild(stats);

            mealInfo.appendChild(name);
            mealInfo.appendChild(ingredients);
            mealInfo.appendChild(footer);

            mealCard.appendChild(imageContainer);
            mealCard.appendChild(mealInfo);

            mealCol.appendChild(mealCard);
            container.appendChild(mealCol);
        });
    } catch (error) {
        console.error('Error loading meals:', error);
    }
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

    document.getElementById('mealsTotal').textContent = `$${mealsTotal.toFixed(2)}`;

    const shipping = 8.99;
    const tax = 10.99;

    const total = mealsTotal + shipping + tax;
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;

    const selectedMealsContainer = document.getElementById('selectedMeals');
    selectedMealsContainer.innerHTML = '';

    cartData.forEach(meal => {
        const mealElement = document.createElement('div');
        mealElement.className = 'meal-item';

        const isSpecial = meal.additionalCharges && meal.additionalCharges > 0;
        if (isSpecial) {
            mealElement.classList.add('special-meal');
        }

        mealElement.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div style="font-weight: bold; font-size: 18px; margin-right: 10px;"><span class="meal-quantity">${meal.count}</span></div>
                <div style="position: relative;">
                    <img src="${meal.image}" alt="${meal.name}" style="width: 90px; height: 60px; object-fit: cover; border-radius: 0px;">
                    ${meal.additionalCharges && meal.additionalCharges > 0
                ? `<div style="position: absolute; bottom: 0; left: 0; background: #D75D33; color: #fff; padding: 2px 5px; font-size: 12px; border-radius: 0 4px 4px 0;">
                                +$${meal.additionalCharges.toFixed(2)}
                            </div>`
                : ''}
                </div>
            </div>
            <div class="meal-details">
                <div class="meal-name">${meal.name}</div>
                <div class="meal-description">${meal.ingredients || ''}</div>
            </div>
        `;

        selectedMealsContainer.appendChild(mealElement);
    });


    document.getElementById('checkout-form').addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Order placed successfully!');
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
    }

    function showSuccess(input) {
        let errorDiv = document.getElementById(`${input.id}Error`);
        if (errorDiv) errorDiv.textContent = "";
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
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
        const inputs = form.querySelectorAll("input:not([type=checkbox]):not([type=hidden])");
        return Array.from(inputs).every(input => input.classList.contains("is-valid"));
    }

    form.addEventListener("blur", (e) => {
        if (e.target.tagName === "INPUT" && e.target.type !== "checkbox") {
            validateInput(e.target);
            const allValid = isFormValid();
            submitBtn.disabled = !allValid;
            submitBtn.style.opacity = allValid ? "1" : "0.7";
            submitBtn.style.cursor = allValid ? "pointer" : "not-allowed";
        }
    }, true);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let allValid = true;
        const inputs = form.querySelectorAll("input:not([type=checkbox]):not([type=hidden])");
        inputs.forEach(input => {
            const valid = validateInput(input);
            if (!valid) allValid = false;
        });

        if (allValid) {
            alert("Checkout submitted successfully!");
        }
    });
});
