$(document).ready(function () {
    const steps = $(".breadcrumb-item");
    let currentStep = 0;
    $("#days-section").hide();
    $(".plans-page-body").show();
    steps.each(function (index) {
        if (index > currentStep) {
            $(this).addClass("disabled");
        }
    });
    steps.on("click", function (e) {
        const index = $(this).index();
        if (index > currentStep) {
            e.preventDefault();
        } else {
            currentStep = index;
            updateBreadcrumbUI(currentStep);
            if (currentStep === 0) {
                $("#days-section").hide();
                $(".plans-page-body").show();
            } else if (currentStep === 1) {
                $("#days-section").show();
                $(".plans-page-body").hide();
            }
        }
    });
    $(".meal-card-wrapper").on("click", function () {
        const mealCount = $(this).find(".meal-count").text().trim();
        const planPrice = $(this).find(".plan-price .price-highlight").text().trim();
        const perMealPrice = $(this).find(".per-meal-price").text().trim();

        localStorage.setItem("mealCount", mealCount);
        localStorage.setItem("planPrice", planPrice);
        localStorage.setItem("perMealPrice", perMealPrice);

        $("#days-mealCount").text(mealCount);
        $("#days-planPrice").text(planPrice);
        $("#days-perMealPrice").text(perMealPrice);

        $(".plans-page-body").hide();
        $("#days-section").show();
        currentStep = 1;
        updateBreadcrumbUI(currentStep);
    });
    $("#back-to-plans").on("click", function () {
        currentStep = 0;
        updateBreadcrumbUI(currentStep);

        $("#days-section").hide();
        $(".plans-page-body").show();
    });

    function updateBreadcrumbUI(currentStep) {
        const steps = $(".breadcrumb-item");
        steps.each(function (index) {
            const link = $(this).find("a");

            if (index < currentStep) {
                $(this).removeClass("disabled").removeClass("breadcrumb-item-active");
                link.removeClass("breadcrumb-link-active");
            } else if (index === currentStep) {
                $(this).removeClass("disabled").addClass("breadcrumb-item-active");
                link.addClass("breadcrumb-link-active");
            } else {
                $(this).addClass("disabled").removeClass("breadcrumb-item-active");
                link.removeClass("breadcrumb-link-active");
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const dateOptions = document.querySelectorAll('.date-option');
    const selectedDateSpan = document.querySelector('.selected-date');
    const firstOption = dateOptions[0];
    const mostPopularTag = firstOption.querySelector('.most-popular-tag');

    dateOptions.forEach(option => {
        option.addEventListener('click', function () {
            dateOptions.forEach(opt => {
                opt.classList.remove('selected');
            });

            this.classList.add('selected');

            if (mostPopularTag) {
                mostPopularTag.style.display = (this === firstOption) ? '' : 'none';
            }

            const selectedDate = this.getAttribute('data-date');
            selectedDateSpan.textContent = selectedDate;
        });
    });
});