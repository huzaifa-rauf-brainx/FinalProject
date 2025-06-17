function selectMealPlan(event, mealCount) {
    const selectedCard = event.currentTarget;

    // Find the parent .col-6 to safely scope queries
    const container = selectedCard.closest('.col-6');

    // Get the plan price and per meal price text
    const planPrice = container.querySelector('.price-highlight')?.textContent.replace('$', '') || '';
    const perMealPrice = container.querySelector('.per-meal-price')?.textContent.replace('$', '').replace('/meal', '') || '';

    // Store meal plan info
    const mealPlanInfo = {
        mealCount: mealCount,
        planPrice: planPrice,
        perMealPrice: perMealPrice
    };

    localStorage.setItem('selectedMealPlan', JSON.stringify(mealPlanInfo));
    console.log('Selected Meal Plan saved:', mealPlanInfo);
}

document.addEventListener('DOMContentLoaded', function () {
    const selectedMealPlan = localStorage.getItem('selectedMealPlan');
    if (selectedMealPlan) {
        const mealPlanInfo = JSON.parse(selectedMealPlan);
        console.log('Previously selected Meal Plan:', mealPlanInfo);
    }
});
