document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".delivery-dates-container");
    const selectedDateSpan = document.querySelector(".selected-date");

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
        }
    });

    container.addEventListener("click", function (e) {
        const option = e.target.closest(".date-option");
        if (!option) return;

        container.querySelectorAll(".date-option").forEach(el => el.classList.remove("selected"));
        option.classList.add("selected");

        selectedDateSpan.textContent = option.dataset.date;

        container.querySelectorAll(".most-popular-tag").forEach(tag => {
            const parent = tag.closest(".date-option");
            if (parent === container.firstElementChild) {
                tag.style.display = option === parent ? "" : "none";
            }
        });
    });

    loadMeals();
});

// Function to load and display meals
async function loadMeals() {
    try {
        const response = await fetch('meals.json');
        const meals = await response.json();
        const template = document.getElementById('card-template');
        const container = document.getElementById('meals-grid');

        meals.forEach(meal => {
            const clone = template.content.cloneNode(true);
            const mealCard = clone.querySelector('.meal-card');

            if (meal.isSpecial) {
                mealCard.classList.add('special');
            }

            clone.querySelector('.meal-img').src = meal.image;
            clone.querySelector('.meal-img').alt = meal.name;

            const priceTag = clone.querySelector('.price-tag');
            if (meal.isSpecial) {
                priceTag.textContent = `+$${meal.additionalCharges.toFixed(2)}`;
            } else {
                priceTag.style.display = "none";
            }

            clone.querySelector('.meal-name').textContent = meal.name;
            clone.querySelector('.meal-ingredients').textContent = meal.ingredients;
            clone.querySelector('.gluten-value').textContent = meal.gluten;
            clone.querySelector('.calories-value').textContent = meal.calories;
            clone.querySelector('.carbs-value').textContent = meal.carbs;
            clone.querySelector('.proteins-value').textContent = meal.proteins;

            const addButton = clone.querySelector('.add-meal-btn');
            addButton.addEventListener('click', () => addToCart(meal));

            container.appendChild(clone);
        });
    } catch (error) {
        console.error('Error loading meals:', error);
    }
}