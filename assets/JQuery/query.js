class NavigationState {
    constructor() {
        this.currentStep = 0;
        this.sections = [
            '.plans-page-body',
            '#days-section',
            '#meals-section',
            '#checkout-section'
        ];
        this.steps = null;
        this.init();
    }

    init() {
        this.steps = document.querySelectorAll('.breadcrumb-item');
        this.initializeSections();
        this.initializeBreadcrumbs();
    }

    initializeSections() {
        this.sections.forEach((sel, i) => {
            const section = document.querySelector(sel);
            if (section) {
                section.style.display = i === this.currentStep ? 'block' : 'none';
            }
        });
    }

    initializeBreadcrumbs() {
        this.steps.forEach((step, index) => {
            if (index > this.currentStep) {
                step.classList.add('disabled');
            }
        });
    }

    updateBreadcrumbUI() {
        this.steps.forEach((item, index) => {
            const link = item.querySelector('a');
            
            if (index === this.currentStep) {
                item.classList.add('breadcrumb-item-active');
                item.classList.remove('disabled');
                if (link) {
                    link.classList.add('breadcrumb-link-active');
                    link.classList.remove('breadcrumb-link');
                }
            } else {
                item.classList.remove('breadcrumb-item-active');
                if (link) {
                    link.classList.remove('breadcrumb-link-active');
                    link.classList.add('breadcrumb-link');
                }

                if (index > this.currentStep) {
                    item.classList.add('disabled');
                } else {
                    item.classList.remove('disabled');
                }
            }
        });
    }

    showStep() {
        this.sections.forEach((sel, i) => {
            const section = document.querySelector(sel);
            if (section) {
                section.style.display = i === this.currentStep ? 'block' : 'none';
            }
        });
    }

    setStep(step) {
        if (step >= 0 && step < this.sections.length) {
            this.currentStep = step;
            this.updateBreadcrumbUI();
            this.showStep();
        }
    }

    canNavigate(step) {
        return step <= this.currentStep;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navigationState = new NavigationState();

    // Event Handlers
    document.addEventListener('click', (e) => {
        // Breadcrumb clicks
        if (e.target.closest('.breadcrumb-item')) {
            const breadcrumbItem = e.target.closest('.breadcrumb-item');
            const index = Array.from(navigationState.steps).indexOf(breadcrumbItem);
            
            if (!navigationState.canNavigate(index)) {
                e.preventDefault();
            } else {
                navigationState.setStep(index);
            }
        }

        // Meal card clicks
        if (e.target.closest('.meal-card-wrapper')) {
            const wrapper = e.target.closest('.meal-card-wrapper');
            const mealCountText = wrapper.querySelector('.meal-count').textContent.trim();
            const mealCount = parseInt(mealCountText.match(/\d+/)[0]);
            const planPrice = wrapper.querySelector('.plan-price .price-highlight').textContent.trim();
            const perMealPrice = wrapper.querySelector('.per-meal-price').textContent.trim();

            localStorage.setItem('mealCount', mealCount.toString());
            localStorage.setItem('planPrice', planPrice);
            localStorage.setItem('perMealPrice', perMealPrice);

            const daysMealCount = document.getElementById('days-mealCount');
            const daysPlanPrice = document.getElementById('days-planPrice');
            const daysPerMealPrice = document.getElementById('days-perMealPrice');

            if (daysMealCount) daysMealCount.textContent = mealCountText;
            if (daysPlanPrice) daysPlanPrice.textContent = planPrice;
            if (daysPerMealPrice) daysPerMealPrice.textContent = perMealPrice;

            navigationState.setStep(1);
        }

        // Next button clicks
        if (e.target.classList.contains('next-btn')) {
            const selectedDate = document.querySelector('.date-option.selected')?.dataset.date;
            if (selectedDate) {
                localStorage.setItem('selectedDate', selectedDate);
                navigationState.setStep(2);
            }
        }

        // Cart next button clicks
        if (e.target.classList.contains('cart-next-btn') && !e.target.disabled) {
            navigationState.setStep(3);
        }
    });
});